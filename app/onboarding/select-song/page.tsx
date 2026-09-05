import Window from "@/components/Window";
import Button, { SecondaryButton } from "@/components/Button";
import Form from "next/form";
import getSpotifyTracks from "@/app/api/spotify/spotify";
import SongSelection from "@/components/SongSelection";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SelectSong({ searchParams }: PageProps) {
  const { q: query } = await searchParams;

  const data = query ? await getSpotifyTracks(query) : null;
  const tracks = data?.tracks?.items || [];

  return (
    <SongSelection tracks={tracks} query={query} />
  );
}