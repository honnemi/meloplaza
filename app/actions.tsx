// app/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function getCurrentUserId() {
  const supabase = await createClient();

  // Always use getUser() on the server for security
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("No active session found:", error?.message);
    return null;
  }

  // This is the unique string ID (UUID) for the anonymous or authenticated user
  const userId = user.id;
  return userId;
}

export async function createUser(
  colour: string,
  faceIndex: number,
  displayName: string
) {
  const supabase = await createClient();

  // 1. Sign the user in anonymously
  const { data: authData, error: authError } =
    await supabase.auth.signInAnonymously();

  if (authError) {
    console.error("Anonymous login failed:", authError.message);
    return { error: `Authentication failed: ${authError.message}` };
  }

  // 2. Safely capture the newly created User ID
  const userId = authData.user?.id;

  // 3. Insert the profile data, embedding the user_id into the record
  const { error: dbError } = await supabase.from("Recommendations").insert({
    user_id: userId,
    colour: colour,
    face_index: faceIndex,
    display_name: displayName,
  });

  if (dbError) {
    console.error("Error inserting data:", dbError.message);
    return { error: dbError.message };
  }

  const headerList = await headers();
  const currentPath = headerList.get("x-pathname") || "/";

  // 4. Refresh Next.js route data safely
  revalidatePath(currentPath);

  return { success: true };
}

interface RecommendationProps {
  prompt: string;
  songName: string;
  songArtist: string;
  songAlbum: string;
  songYear: string;
  message: string;
  songId: string;
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
      "id, created_by, created_at, prompt, song_name, song_artist, song_album, song_year, message, song_id, song_album_cover"
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