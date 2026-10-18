import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userId,
      displayName,
      colour,
      faceIndex,
      prompt,
      songName,
      songArtist,
      songAlbum,
      songAlbumCover,
      songYear,
      songId,
      message,
      songDuration,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in request body" },
        { status: 400 },
      );
    }

    const supabaseAdmin = createAdminClient();

    const { error: userError } = await supabaseAdmin.from("Users").insert({
      id: userId,
      display_name: displayName || "Anonymous",
      colour: colour || "#3b82f6",
      face_index: faceIndex ?? 0,
    });

    if (userError && userError.code !== "23505") {
      console.error("Users insert error:", userError);
      return NextResponse.json(
        { error: userError.message },
        { status: 500 },
      );
    }

    const { error: recommendationError } = await supabaseAdmin
      .from("Recommendations")
      .insert({
        created_by: userId,
        prompt: prompt || null,
        song_id: songId || null,
        song_name: songName || null,
        song_artist: songArtist || null,
        song_album: songAlbum || null,
        song_album_cover: songAlbumCover || null,
        song_year: songYear || null,
        song_duration: songDuration || null,
        message: message || null,
      });

    if (recommendationError) {
      console.error("Recommendations insert error:", recommendationError);
      return NextResponse.json(
        { error: recommendationError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Server error";

    console.error("API POST error:", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      userId,
      editMode,
      displayName,
      colour,
      faceIndex,
      prompt,
      songName,
      songArtist,
      songAlbum,
      songAlbumCover,
      songYear,
      songId,
      message,
      songDuration,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in request body" },
        { status: 400 },
      );
    }

    if (editMode !== "melo" && editMode !== "recommendation") {
      return NextResponse.json(
        { error: "Invalid edit mode" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: "You are not authorised to update this profile." },
        { status: 401 },
      );
    }

    const supabaseAdmin = createAdminClient();

    if (editMode === "melo") {
      const { data: existingUser, error: lookupError } =
        await supabaseAdmin
          .from("Users")
          .select("id")
          .eq("id", userId)
          .maybeSingle();

      if (lookupError) {
        throw lookupError;
      }

      if (!existingUser) {
        return NextResponse.json(
          { error: "User profile not found." },
          { status: 404 },
        );
      }

      const { error } = await supabaseAdmin
        .from("Users")
        .update({
          display_name: displayName || "Anonymous",
          colour: colour || "#3b82f6",
          face_index: faceIndex ?? 0,
        })
        .eq("id", userId);

      if (error) {
        throw error;
      }
    }

    if (editMode === "recommendation") {
      // A user can now have many recommendations (history). The newest one is
      // their "current" recommendation, so look that one up (the old
      // .maybeSingle() would throw as soon as there were two rows).
      const { data: latest, error: lookupError } = await supabaseAdmin
        .from("Recommendations")
        .select("id, prompt, song_id, message")
        .eq("created_by", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lookupError) {
        throw lookupError;
      }

      if (!latest) {
        return NextResponse.json(
          { error: "Recommendation not found." },
          { status: 404 },
        );
      }

      // If nothing about the recommendation changed (e.g. user hit Save
      // without editing), don't add a duplicate to their history.
      const unchanged =
        (latest.song_id ?? null) === (songId || null) &&
        (latest.prompt ?? null) === (prompt || null) &&
        (latest.message ?? null) === (message || null);

      if (!unchanged) {
        const { error } = await supabaseAdmin.from("Recommendations").insert({
          created_by: userId,
          prompt: prompt || null,
          song_id: songId || null,
          song_name: songName || null,
          song_artist: songArtist || null,
          song_album: songAlbum || null,
          song_album_cover: songAlbumCover || null,
          song_year: songYear || null,
          song_duration: songDuration ?? null,
          message: message || null,
        });

        if (error) {
          throw error;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Server error";

    console.error("API PUT error:", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}