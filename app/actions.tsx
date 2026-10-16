// app/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";


export async function getCurrentUserId() {
  const supabase = await createClient();

  // Get current "signed-in" user for session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("No active session found:", error?.message);
    return null;
  }

  // Get user ID
  const userId = user.id;
  return userId;
}


interface RecommendationProps {
  prompt: string;
  songName: string;
  songArtist: string;
  songAlbum: string;
  songYear: string;
  message: string;
  songId: string;
  songDuration: number;
  createdFor?: string;
}


export async function createRecommendation({
  prompt,
  songName,
  songArtist,
  songAlbum,
  songYear,
  message,
  songId,
  songDuration,
}: RecommendationProps) {
  const supabase = await createClient();
  const currentUserId = await getCurrentUserId();

  const { error } = await supabase.from("Recommendations").insert({
    prompt: prompt,
    song_name: songName,
    song_artist: songArtist,
    song_album: songAlbum,
    song_year: songYear,
    message: message,
    song_id: songId,
    song_duration: songDuration,
    created_by: currentUserId,
  });

  if (error) {
    console.error("Error inserting data:", error.message);
    return { error: error.message };
  }

  const headerList = await headers();
  const currentPath = headerList.get("x-pathname") || "/";

  revalidatePath(currentPath);

  return { success: true };
}


export async function getUserRecommendationById(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Recommendations")
    .select(
      "id, created_by, created_at, prompt, song_name, song_artist, song_album, song_year, message, song_id, song_album_cover, song_duration",
    )
    .eq("created_by", userId)
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }

  return data;
}


export async function getUserById(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Users")
    .select("id, colour, face_index, display_name")
    .eq("id", userId)
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }

  return data;
}


export async function addToCollection(recommendationId: string) {
  const supabase = await createClient();
  const currentUserId = await getCurrentUserId();

  if (!currentUserId) {
    return { error: "You must be logged in to save recommendations." };
  }

  // 1. Fetch the recommendation snapshot data
  const { data: recommendation, error: fetchError } = await supabase
    .from("Recommendations")
    .select("*")
    .eq("id", recommendationId)
    .single();

  if (fetchError || !recommendation) {
    console.error("Failed to fetch recommendation for collection:", fetchError?.message);
    return { error: "Recommendation not found." };
  }

  // 2. Insert the snapshot copy using your exact table columns
  const { error: insertError } = await supabase.from("CollectionItems").insert({
    added_by: currentUserId, // Matches your 'added_by' column
    recommendation: recommendationId, // Foreign key for collection count analytics
    song_name: recommendation.song_name,
    song_artist: recommendation.song_artist,
    song_album: recommendation.song_album,
    song_year: recommendation.song_year,
    song_album_cover: recommendation.song_album_cover,
    prompt: recommendation.prompt,
    message: recommendation.message,
    original_creator_id: recommendation.created_by,
  });

  if (insertError) {
    console.error("Failed to add snapshot to collection:", insertError.message);
    return { error: insertError.message };
  }

  revalidatePath("/collection");
  return { success: true };
}


export async function isInCollection(recommendationId: string) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return false;
  }

  const { data, error } = await supabase
    .from("CollectionItems")
    .select("id")
    .eq("recommendation", recommendationId)
    .eq("added_by", userId)
    .maybeSingle();

  if (error) {
    console.error("Error checking collection:", error.message);
    return false;
  }

  return !!data;
}


export async function getUserCollection(userId?: string) {
  if (!userId || userId === "undefined" || userId === "null") {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("CollectionItems")
    .select(`
      id,
      added_at,
      recommendation,
      song_name,
      song_artist,
      song_album,
      song_year,
      song_album_cover,
      prompt,
      message,
      original_creator_id,
      original_creator:Users!original_creator_id (
        id,
        display_name,
        colour,
        face_index
      )
    `)
    .eq("added_by", userId)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("Error fetching collection:", error.message);
    return [];
  }

  // Unwrap original_creator array into a single object
  return (data || []).map((item: any) => ({
    ...item,
    original_creator: Array.isArray(item.original_creator)
      ? item.original_creator[0] || null
      : item.original_creator,
  }));
}

export async function getRecommendationCollectionCount(recommendationId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("CollectionItems")
    .select("*", { count: "exact", head: true })
    .eq("recommendation", recommendationId);

  if (error) {
    console.error("Error fetching collection count:", error.message);
    return 0;
  }

  return count || 0;
}


export async function upgradeAnonymousAccount(email: string, password: string) {
  // 1. Sanitize input
  const trimmedEmail = email.trim().toLowerCase();

  // 2. Email format validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    return { error: "Please enter a valid email address." };
  }

  // 3. Password length check
  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const supabase = await createClient();

  // 4. Update the anonymous user to a permanent account
  const { data, error } = await supabase.auth.updateUser({
    email: trimmedEmail,
    password: password,
  });

  if (error) {
    console.error("Failed to upgrade account:", error.message);

    if (error.message.includes("already registered")) {
      return { error: "An account with this email address already exists." };
    }
    return { error: error.message };
  }

  return { success: true, user: data.user };
}


export async function updateUserRecommendation(formData: {
  displayName: string;
  colour: string;
  faceIndex: number;
  prompt: string;
  song: any;
  message: string;
}) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return { error: "User not authenticated." };
  }

  // 1. Update user profile (display name, colour, face)
  const { error: userError } = await supabase
    .from("Users")
    .update({
      display_name: formData.displayName,
      colour: formData.colour,
      face_index: formData.faceIndex,
    })
    .eq("id", userId);

  if (userError) {
    console.error("Failed to update user:", userError.message);
    return { error: userError.message };
  }

  // 2. Update recommendation details
  const { error: recError } = await supabase
    .from("Recommendations")
    .update({
      prompt: formData.prompt,
      song_id: formData.song.id,
      song_name: formData.song.name,
      song_artist: formData.song.artist,
      song_album: formData.song.album,
      song_year: formData.song.year,
      song_album_cover: formData.song.albumCover,
      message: formData.message,
    })
    .eq("created_by", userId);

  if (recError) {
    console.error("Failed to update recommendation:", recError.message);
    return { error: recError.message };
  }

  return { success: true };
}

export async function getRooms() {
    const supabase = await createClient();

    const {
        data: rooms,
        error,
    } = await supabase
        .from("Rooms")
        .select("*");

    if (error) {
        console.error("Error fetching rooms:", error);
        return [];
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const roomsWithMembers = await Promise.all(
        rooms.map(async (room) => {
            const { count, error: countError } = await supabase
                .from("RoomMembers")
                .select("room_id", { count: "exact", head: true })
                .eq("room_id", room.id);

            if (countError) {
                console.error("Error fetching room member count:", countError);
            }

            let isMember = false;

            if (user) {
                const { data: membership, error: membershipError } =
                    await supabase
                        .from("RoomMembers")
                        .select("user_id")
                        .eq("room_id", room.id)
                        .eq("user_id", user.id)
                        .maybeSingle();

                if (membershipError) {
                    console.error("Error checking room membership:", membershipError);
                }

                isMember = !!membership;
            }

            return {
                id: room.id,
                createdAt: room.created_at,
                name: room.name,
                description: room.description,
                capacity: room.capacity,
                memberCount: count ?? 0,
                isMember,
            };
        })
    );

    return roomsWithMembers;
}

export async function joinRoom(roomId: string) {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return { success: false, error: "You must be signed in to join a room." };
    }

    const { data: room, error: roomError } = await supabase
        .from("Rooms")
        .select("capacity")
        .eq("id", roomId)
        .single();

    if (roomError || !room) {
        return { success: false, error: "Room not found." };
    }

    const { data: existingMembership, error: existingError } = await supabase
        .from("RoomMembers")
        .select("user_id")
        .eq("room_id", roomId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (existingError) {
        console.error("Error checking membership:", existingError);
        return { success: false, error: "Could not check room membership." };
    }

    if (existingMembership) {
        return { success: true };
    }

    const { count, error: countError } = await supabase
        .from("RoomMembers")
        .select("room_id", { count: "exact", head: true })
        .eq("room_id", roomId);

    if (countError) {
        console.error("Error checking room capacity:", countError);
        return { success: false, error: "Could not check room capacity." };
    }

    if ((count ?? 0) >= room.capacity) {
        return { success: false, error: "This room is full." };
    }

    const { error: insertError } = await supabase
        .from("RoomMembers")
        .insert({
            room_id: roomId,
            user_id: user.id,
        });

    if (insertError) {
        console.error("Error joining room:", insertError);
        return { success: false, error: "Could not join the room." };
    }

    return { success: true };
}

export async function leaveRoom(roomId: string) {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return { success: false, error: "You must be signed in to leave a room." };
    }

    const { error } = await supabase
        .from("RoomMembers")
        .delete()
        .eq("room_id", roomId)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error leaving room:", error);
        return { success: false, error: "Could not leave the room." };
    }

    return { success: true };
}

export async function createRoom(
    name: string,
    description: string,
    capacity: number
) {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return {
            success: false,
            error: "You must be signed in to create a room.",
        };
    }

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedDescription) {
        return {
            success: false,
            error: "Please enter a room name and description.",
        };
    }

    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) {
        return {
            success: false,
            error: "Capacity must be between 1 and 50.",
        };
    }

    const { data: room, error: roomError } = await supabase
        .from("Rooms")
        .insert({
            name: trimmedName,
            description: trimmedDescription,
            capacity,
        })
        .select("id")
        .single();

    if (roomError || !room) {
        console.error("Error creating room:", roomError);
        return {
            success: false,
            error: roomError?.message ?? "Could not create the room.",
        };
    }

    const { error: memberError } = await supabase
        .from("RoomMembers")
        .insert({
            room_id: room.id,
            user_id: user.id,
        });

    if (memberError) {
        console.error("Error adding creator to room:", memberError);

        // Remove the room if its creator could not be added.
        const { error: cleanupError } = await supabase
            .from("Rooms")
            .delete()
            .eq("id", room.id);

        if (cleanupError) {
            console.error("Error cleaning up newly created room:", cleanupError);
        }

        return {
            success: false,
            error: "The room could not be created with its initial member.",
        };
    }

    return { success: true };
}


export async function getRoomById(roomId: string) {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
        console.error("Error getting current user:", authError);
    }

    const { data: room, error: roomError } = await supabase
        .from("Rooms")
        .select("*")
        .eq("id", roomId)
        .single();

    if (roomError || !room) {
        console.error("Error fetching room:", roomError);
        return null;
    }

    const { data: memberships, error: membersError } = await supabase
        .from("RoomMembers")
        .select("user_id")
        .eq("room_id", roomId);

    if (membersError) {
        console.error("Error fetching room memberships:", membersError);
        return null;
    }

    const userIds = [...new Set(
        (memberships ?? []).map((membership) => membership.user_id)
    )];

    let members: {
        id: string;
        display_name: string;
        colour: string;
        face_index: number;
    }[] = [];

    if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
            .from("Users")
            .select("id, display_name, colour, face_index")
            .in("id", userIds);

        if (profilesError) {
            console.error("Error fetching room member profiles:", profilesError);
            return null;
        }

        members = profiles ?? [];
    }

    return {
        id: room.id,
        createdAt: room.created_at,
        name: room.name,
        description: room.description,
        capacity: room.capacity,
        memberCount: userIds.length,
        isMember: user ? userIds.includes(user.id) : false,
        members,
    };
}


