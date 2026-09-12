import SongSelection from "@/components/SongSelection";
import getSpotifyTracks from "@/app/api/spotify/spotify";

import ProfilePreview from "@/components/ProfilePreview"

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
    <div className="w-full min-h-screen flex flex-col items-center justify-start gap-10 p-6 sm:p-12 lg:flex-row">
      <ProfilePreview />
      <SongSelection tracks={tracks} query={query} />
    </div>
  );
}