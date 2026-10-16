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
  const { data, error } = await supabase.from("Rooms").select(`*`)

  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }

  const items = data.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    description: row.description,
    capacity: row.capacity
  }));

  return items
}

