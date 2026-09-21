import SongSelection from "@/components/SongSelection";
import getSpotifyTracks from "@/app/api/spotify/spotify";
import ProfilePreview from "@/components/ProfilePreview";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SelectSong({
  searchParams,
}: PageProps) {
  const { q: query } = await searchParams;

  const data = query ? await getSpotifyTracks(query) : null;
  const rawTracks = data?.tracks?.items || [];

  // FIX: Explicitly flatten and map properties before passing to the Client Component
  const tracks = rawTracks.map((track: any) => ({
    id: track.id,
    name: track.name,
    duration_ms: track.duration_ms || 0, // Enforces serialization layout safely
    artists: track.artists?.map((a: any) => ({ name: a.name })) || [],
    album: {
      name: track.album?.name || "",
      release_date: track.album?.release_date || "",
      images: track.album?.images || [],
    },
  }));

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start gap-10 p-6 sm:p-12 lg:flex-row">
      <ProfilePreview />
      {/* Passing the strictly mapped tracks safe from serialization drops */}
      <SongSelection tracks={tracks} query={query} />
    </div>
  );
}
