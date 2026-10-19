"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

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

interface SongInput {
  id: string;
  name: string;
  artist: string;
  album: string;
  year: string;
  albumCover: string;
}

const RECOMMENDATION_COLUMNS =
  "id, created_by, created_at, prompt, song_name, song_artist, song_album, song_year, message, song_id, song_album_cover, song_duration";

const MIN_ROOM_CAPACITY = 1;
const MAX_ROOM_CAPACITY = 50;

const fail = (error: string) => ({ success: false as const, error });

// Returns authorised user
async function getAuthUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return error ? null : user;
}

// Supabase joins can come back as an object or a one-item array
function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

// Refreshes cashed data for page
function revalidateRoomPaths(roomId?: string) {
  revalidatePath("/rooms");
  revalidatePath("/plaza");
  if (roomId) revalidatePath(`/room/${roomId}`);
}

// ─────────────────────────────────────────────────────────────
// Auth & users
// ─────────────────────────────────────────────────────────────

export async function getCurrentUserId() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("No active session found:", error?.message);
    return null;
  }

  return user.id;
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

export async function upgradeAnonymousAccount(email: string, password: string) {
  const trimmedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    return { error: "Please enter a valid email address." };
  }

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.updateUser({
    email: trimmedEmail,
    password,
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

// ─────────────────────────────────────────────────────────────
// Recommendations
// ─────────────────────────────────────────────────────────────

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

  if (!currentUserId) {
    return { error: "You must be logged in to create a recommendation." };
  }

  const { error } = await supabase.from("Recommendations").insert({
    prompt,
    song_name: songName,
    song_artist: songArtist,
    song_album: songAlbum,
    song_year: songYear,
    message,
    song_id: songId,
    song_duration: songDuration,
    created_by: currentUserId,
  });

  if (error) {
    console.error("Error inserting recommendation:", error.message);
    return { error: error.message };
  }

  const headerList = await headers();
  revalidatePath(headerList.get("x-pathname") || "/");

  return { success: true };
}

interface SongInput {
  id: string;
  name: string;
  artist: string;
  album: string;
  year: string;
  albumCover: string;
  duration?: number;
}

export async function getUserRecommendationById(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Recommendations")
    .select(RECOMMENDATION_COLUMNS)
    .eq("created_by", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user recommendation:", error.message);
    return null;
  }

  return data;
}

export async function getUserRecommendations(userId?: string) {
  if (!userId || userId === "undefined" || userId === "null") {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Recommendations")
    .select(RECOMMENDATION_COLUMNS)
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user recommendations:", error.message);
    return [];
  }

  const recommendations = data ?? [];
  if (recommendations.length === 0) return [];

  const { data: saves, error: countError } = await supabase
    .from("CollectionItems")
    .select("recommendation")
    .in(
      "recommendation",
      recommendations.map((r) => r.id),
    );

  if (countError) {
    console.error("Error fetching save counts:", countError.message);
  }

  const counts = new Map<string, number>();
  for (const save of saves ?? []) {
    counts.set(save.recommendation, (counts.get(save.recommendation) ?? 0) + 1);
  }

  return recommendations.map((r) => ({
    ...r,
    collection_count: counts.get(r.id) ?? 0,
  }));
}

export async function updateUserRecommendation(formData: {
  displayName: string;
  colour: string;
  faceIndex: number;
  prompt: string;
  song: SongInput;
  message: string;
}) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return { error: "User not authenticated." };
  }

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

  const { song } = formData;
  const latest = await getUserRecommendationById(userId);

  const sameSong = !!latest && latest.song_id === song.id;
  const unchanged =
    sameSong &&
    latest.prompt === formData.prompt &&
    latest.message === formData.message;

  if (unchanged) {
    return { success: true };
  }

  const { error: recError } = await supabase.from("Recommendations").insert({
    created_by: userId,
    prompt: formData.prompt,
    song_id: song.id,
    song_name: song.name,
    song_artist: song.artist,
    song_album: song.album,
    song_year: song.year,
    song_album_cover: song.albumCover,
    song_duration: sameSong ? latest.song_duration : (song.duration ?? 0),
    message: formData.message,
  });

  if (recError) {
    console.error("Failed to create recommendation version:", recError.message);
    return { error: recError.message };
  }

  revalidatePath("/collection");
  return { success: true };
}

export async function deleteRecommendation(recommendationId: string) {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  if (!user) return fail("You must be signed in to delete a recommendation.");
  if (!recommendationId) return fail("Invalid recommendation.");

  const latest = await getUserRecommendationById(user.id);

  if (latest?.id === recommendationId) {
    return fail(
      "You can't delete your current recommendation. Edit it to replace it, then delete the old one.",
    );
  }

  const { data: deleted, error } = await supabase
    .from("Recommendations")
    .delete()
    .eq("id", recommendationId)
    .eq("created_by", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Error deleting recommendation:", error.message);
    return fail(`Could not delete recommendation: ${error.message}`);
  }

  if (!deleted) {
    return fail(
      "Recommendation not found, or deletion was blocked. Check the Recommendations DELETE policy in Supabase.",
    );
  }

  revalidatePath("/collection");
  return { success: true as const };
}

// ─────────────────────────────────────────────────────────────
// Collection
// ─────────────────────────────────────────────────────────────

export async function addToCollection(recommendationId: string) {
  const supabase = await createClient();
  const currentUserId = await getCurrentUserId();

  if (!currentUserId) {
    return { error: "You must be logged in to save recommendations." };
  }

  const { data: recommendation, error: fetchError } = await supabase
    .from("Recommendations")
    .select("*")
    .eq("id", recommendationId)
    .single();

  if (fetchError || !recommendation) {
    console.error(
      "Failed to fetch recommendation for collection:",
      fetchError?.message,
    );
    return { error: "Recommendation not found." };
  }

  const { error: insertError } = await supabase.from("CollectionItems").insert({
    added_by: currentUserId,
    recommendation: recommendationId,
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

  if (!userId) return false;

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
    .select(
      `
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
    `,
    )
    .eq("added_by", userId)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("Error fetching collection:", error.message);
    return [];
  }

  return (data ?? []).map((item) => ({
    ...item,
    original_creator: unwrapRelation(item.original_creator),
  }));
}

export async function getRecommendationCollectionCount(
  recommendationId: string,
) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("CollectionItems")
    .select("*", { count: "exact", head: true })
    .eq("recommendation", recommendationId);

  if (error) {
    console.error("Error fetching collection count:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function deleteCollectionItem(collectionItemId: string) {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  if (!user) return fail("You must be signed in to edit your collection.");
  if (!collectionItemId) return fail("Invalid collection item.");

  const { data: deleted, error } = await supabase
    .from("CollectionItems")
    .delete()
    .eq("id", collectionItemId)
    .eq("added_by", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Error deleting collection item:", error.message);
    return fail(`Could not remove this song: ${error.message}`);
  }

  if (!deleted) {
    return fail(
      "Song not found, or removal was blocked. Check the CollectionItems DELETE policy in Supabase.",
    );
  }

  revalidatePath("/collection");
  return { success: true as const };
}

// ─────────────────────────────────────────────────────────────
// Rooms: reading
// ─────────────────────────────────────────────────────────────

export async function getRooms() {
  const supabase = await createClient();

  // Three queries total, instead of two per room.
  const [roomsResult, membersResult, user] = await Promise.all([
    supabase.from("Rooms").select("*"),
    supabase.from("RoomMembers").select("room_id, user_id"),
    getAuthUser(supabase),
  ]);

  if (roomsResult.error) {
    console.error("Error fetching rooms:", roomsResult.error);
    return [];
  }

  if (membersResult.error) {
    console.error("Error fetching room members:", membersResult.error);
  }

  const memberCounts = new Map<string, number>();
  const joinedRoomIds = new Set<string>();

  for (const member of membersResult.data ?? []) {
    memberCounts.set(
      member.room_id,
      (memberCounts.get(member.room_id) ?? 0) + 1,
    );

    if (user && member.user_id === user.id) {
      joinedRoomIds.add(member.room_id);
    }
  }

  return roomsResult.data.map((room) => ({
    id: room.id,
    createdAt: room.created_at,
    name: room.name,
    description: room.description,
    capacity: room.capacity,
    memberCount: memberCounts.get(room.id) ?? 0,
    isMember: joinedRoomIds.has(room.id),
    created_by: room.created_by,
  }));
}

export async function getRoomById(roomId: string) {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

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

  const userIds = [...new Set((memberships ?? []).map((m) => m.user_id))];

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
    created_by: room.created_by,
  };
}

// ─────────────────────────────────────────────────────────────
// Rooms: writing
// ─────────────────────────────────────────────────────────────

export async function createRoom(
  name: string,
  description: string,
  capacity: number,
) {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  if (!user) return fail("You must be signed in to create a room.");

  const trimmedName = name.trim();
  const trimmedDescription = description.trim();

  if (!trimmedName || !trimmedDescription) {
    return fail("Please enter a room name and description.");
  }

  if (
    !Number.isInteger(capacity) ||
    capacity < MIN_ROOM_CAPACITY ||
    capacity > MAX_ROOM_CAPACITY
  ) {
    return fail(
      `Capacity must be between ${MIN_ROOM_CAPACITY} and ${MAX_ROOM_CAPACITY}.`,
    );
  }

  const { data: room, error: roomError } = await supabase
    .from("Rooms")
    .insert({
      name: trimmedName,
      description: trimmedDescription,
      capacity,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (roomError || !room) {
    console.error("Error creating room:", roomError);
    return fail(roomError?.message ?? "Could not create the room.");
  }

  const { error: memberError } = await supabase.from("RoomMembers").insert({
    room_id: room.id,
    user_id: user.id,
  });

  if (memberError) {
    console.error("Error adding creator to room:", memberError);

    const { error: cleanupError } = await supabase
      .from("Rooms")
      .delete()
      .eq("id", room.id);

    if (cleanupError) {
      console.error("Error cleaning up newly created room:", cleanupError);
    }

    return fail(
      `The room was created, but adding you as a member failed: ${memberError.message}`,
    );
  }

  revalidateRoomPaths();
  return { success: true as const };
}

export async function joinRoom(roomId: string) {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  if (!user) return fail("You must be signed in to join a room.");
  if (!roomId) return fail("Invalid room.");

  const { data: room, error: roomError } = await supabase
    .from("Rooms")
    .select("id, capacity")
    .eq("id", roomId)
    .maybeSingle();

  if (roomError) {
    console.error("Error fetching room:", roomError);
    return fail(`Could not fetch room: ${roomError.message}`);
  }

  if (!room) return fail("Room not found.");

  const { data: existingMembership, error: membershipError } = await supabase
    .from("RoomMembers")
    .select("user_id")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    console.error("Error checking membership:", membershipError);
    return fail(`Could not check membership: ${membershipError.message}`);
  }

  // Already in the room
  if (existingMembership) return { success: true as const };

  const { count, error: countError } = await supabase
    .from("RoomMembers")
    .select("user_id", { count: "exact", head: true })
    .eq("room_id", roomId);

  if (countError) {
    console.error("Error checking room capacity:", countError);
    return fail(`Could not check room capacity: ${countError.message}`);
  }

  if ((count ?? 0) >= room.capacity) return fail("This room is full.");

  const { error: insertError } = await supabase.from("RoomMembers").insert({
    room_id: roomId,
    user_id: user.id,
  });

  if (insertError) {
    // Unique violation: joined in another tab a moment ago
    if (insertError.code === "23505") return { success: true as const };

    console.error("Error joining room:", insertError);
    return fail(`Could not join room: ${insertError.message}`);
  }

  revalidateRoomPaths(roomId);
  return { success: true as const };
}

export async function leaveRoom(roomId: string) {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  if (!user) return fail("You must be signed in to leave a room.");
  if (!roomId) return fail("Invalid room.");

  const { data: room, error: roomError } = await supabase
    .from("Rooms")
    .select("created_by")
    .eq("id", roomId)
    .maybeSingle();

  if (roomError) {
    console.error("Error fetching room before leaving:", roomError);
    return fail(`Could not fetch room: ${roomError.message}`);
  }

  if (!room) return fail("Room not found.");

  // Owners can't leave their own room (they delete it instead)
  if (room.created_by === user.id) {
    return fail("Owners can't leave their own room. Delete it instead.");
  }

  const { data: membership, error: checkError } = await supabase
    .from("RoomMembers")
    .select("user_id")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking membership before leaving:", checkError);
    return fail(`Could not check membership: ${checkError.message}`);
  }

  if (!membership) return fail("You are not a member of this room.");

  const { data: deletedMembership, error: deleteError } = await supabase
    .from("RoomMembers")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .select("user_id")
    .maybeSingle();

  if (deleteError) {
    console.error("Error leaving room:", deleteError);
    return fail(`Could not leave room: ${deleteError.message}`);
  }

  if (!deletedMembership) {
    return fail(
      "Your membership was not deleted. Check the RoomMembers DELETE policy in Supabase.",
    );
  }

  revalidateRoomPaths(roomId);
  return { success: true as const };
}

export async function deleteRoom(roomId: string) {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  if (!user) return fail("You must be signed in to delete a room.");

  const { data: room, error: roomError } = await supabase
    .from("Rooms")
    .select("id")
    .eq("id", roomId)
    .eq("created_by", user.id)
    .maybeSingle();

  if (roomError) {
    console.error("Error checking room ownership:", roomError);
    return fail(roomError.message);
  }

  if (!room) return fail("Room not found or you do not own this room.");

  const { data: deletedRoom, error: deleteError } = await supabase
    .from("Rooms")
    .delete()
    .eq("id", roomId)
    .eq("created_by", user.id)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    console.error("Error deleting room:", deleteError);
    return fail(`Could not delete room: ${deleteError.message}`);
  }

  if (!deletedRoom) {
    return fail("The room was not deleted. Check your database permissions.");
  }

  revalidateRoomPaths();
  return { success: true as const };
}
