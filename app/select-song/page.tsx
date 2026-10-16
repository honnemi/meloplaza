import SongSelection from "@/components/SongSelection";
import getSpotifyTracks from "@/app/api/spotify/spotify";
import ProfilePreview from "@/components/ProfilePreview";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SelectSong({ searchParams }: PageProps) {
  const { q: query } = await searchParams;

  // Fetch tracks from Spotify based on the query parameter
  const data = query ? await getSpotifyTracks(query) : null;
  const rawTracks = data?.tracks?.items || [];

  // Map track data to array of objects for SongSelection component
  const tracks = rawTracks.map((track: any) => ({
    id: track.id,
    name: track.name,
    duration_ms: track.duration_ms || 0,
    artists: track.artists?.map((a: any) => ({ name: a.name })) || [],
    album: {
      name: track.album?.name || "",
      release_date: track.album?.release_date || "",
      images: track.album?.images || [],
    },
  }));

  return (
    <div className="w-full min-h-screen overflow-hidden flex flex-col items-center justify-start gap-10 p-6 sm:p-12 lg:flex-row lg:h-screen">
      {/* Show profile preview */}
      <ProfilePreview />
      {/* Show song selection component */}
      <SongSelection tracks={tracks} query={query} />
    </div>
  );
}
