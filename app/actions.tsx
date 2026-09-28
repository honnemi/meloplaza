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

export async function createRecommendationForUser({
  prompt,
  songName,
  songArtist,
  songAlbum,
  songYear,
  message,
  songId,
  songDuration,
  createdFor,
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
    created_for: createdFor,
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
  const userId = await getCurrentUserId();

  if (!userId) {
    return { error: "No active user found." };
  }

  const { error } = await supabase.from("CollectionItems").insert({
    recommendation: recommendationId,
    added_by: userId,
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

export async function getUserCollection() {
  const supabase = await createClient();
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("CollectionItems")
    .select(
      `
      recommendation,
      Recommendations (
        id,
        song_name,
        song_artist,
        song_album,
        song_album_cover,
        song_year,
        song_duration,
        created_at,
        prompt,
        message,
        created_by
      )
    `,
    )
    .eq("added_by", userId);

  if (error) {
    console.error("Error getting collection:", error.message);
    return [];
  }

  const formattedData = data.map((item) => {
    const rawRecommendations = item.Recommendations;

    return {
      ...item,
      Recommendations: Array.isArray(rawRecommendations)
        ? rawRecommendations[0]
        : rawRecommendations,
    };
  });

  return formattedData;
}
