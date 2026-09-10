import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Extract userId sent from client body
    const { userId, displayName, colour, faceIndex, prompt, songName, songArtist, songAlbum, songAlbumCover, songYear, songId, message } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId in request body' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    // Insert distinct User record
    const { error: userError } = await supabaseAdmin
    .from('Users')
    .insert({
        id: userId, // Auth UUID from client
        display_name: displayName || 'Anonymous',
        colour: colour || '#3b82f6',
        face_index: faceIndex ?? 0,
    });

    if (userError) {
    // If user already exists, ignore or handle duplicate error
    if (userError.code !== '23505') { // 23505 = unique_violation
        console.error('Users insert error:', userError);
        return NextResponse.json({ error: userError.message }, { status: 500 });
    }
    }

    // Insert Recommendation linked to this distinct userId
    const { error: recError } = await supabaseAdmin
    .from('Recommendations')
    .insert({
        created_by: userId,
        prompt: prompt || null,
        song_id: songId || null,
        song_name: songName || null,
        song_artist: songArtist || null,
        song_album: songAlbum || null,
        song_album_cover: songAlbumCover || null,
        song_year: songYear || null,
        message: message || null,
    });

    if (recError) {
      console.error('Recommendations insert error:', recError)
      return NextResponse.json({ error: recError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API Error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}