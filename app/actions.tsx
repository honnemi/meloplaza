// app/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from 'next/headers';

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

export async function createUser(colour: string, faceIndex: number, displayName: string) {
  const supabase = await createClient();

  // 1. Sign the user in anonymously 
  const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

  if (authError) {
    console.error("Anonymous login failed:", authError.message);
    return { error: `Authentication failed: ${authError.message}` };
  }

  // 2. Safely capture the newly created User ID
  const userId = authData.user?.id;

  // 3. Insert the profile data, embedding the user_id into the record
  const { error: dbError } = await supabase.from("Recommendations").insert({
    user_id: userId, // 👈 Added this mapping line
    colour: colour,
    face_index: faceIndex,
    display_name: displayName
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

  const { error } = await supabase.from("Recommendations").insert({
    prompt: prompt,
    song_name: songName,
    song_artist: songArtist,
    song_album: songAlbum,
    song_year: songYear,
    message: message,
    song_id: songId,
    createdBy: getCurrentUserId(),
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

  const { error } = await supabase.from("Recommendations").insert({
    prompt: prompt,
    song_name: songName,
    song_artist: songArtist,
    song_album: songAlbum,
    song_year: songYear,
    message: message,
    song_id: songId,
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
