import SongSelection from "@/components/SongSelection";
import getSpotifyTracks from "@/app/api/spotify/spotify";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SelectSong({
  searchParams,
}: PageProps) {
  const { q: query } = await searchParams;

  const data = query ? await getSpotifyTracks(query) : null;
  const tracks = data?.tracks?.items || [];

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-3 py-6 sm:px-6 sm:py-10 lg:px-12">
      <SongSelection tracks={tracks} query={query} />
    </div>
  );
}