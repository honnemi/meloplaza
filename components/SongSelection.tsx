"use client";

import { useState, useEffect } from "react";
import Window from "@/components/Window";
import Button, { SecondaryButton } from "@/components/Button";
import Form from "next/form";
import SearchResults from "@/components/SearchResults";
import { useFormStore } from "@/app/context/FormContext";

interface SongSelectionProps {
  tracks: any[];
  query?: string;
}

export default function SongSelection({
  tracks,
  query,
}: SongSelectionProps) {
  const { formData, updateForm } = useFormStore();
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

  useEffect(() => {
    if (formData.songId && !selectedTrack) {
      setSelectedTrack({
        id: formData.songId,
        name: formData.songName,
        artists: [{ name: formData.songArtist }],
        album: {
          name: formData.songAlbum,
          release_date: formData.songYear,
          images: formData.songAlbumCover
            ? [{ url: formData.songAlbumCover }]
            : [],
        },
      });
    }
  }, [formData, selectedTrack]);

  const handleNext = () => {
    if (selectedTrack) {
      // Extract cover URL
      const albumCoverUrl =
        selectedTrack.album?.images?.[0]?.url ||
        selectedTrack.albumCover ||
        formData.songAlbumCover ||
        "";

      updateForm({
        songId: selectedTrack.id,
        songName: selectedTrack.name,
        songArtist:
          selectedTrack.artists?.[0]?.name ||
          selectedTrack.songArtist ||
          "",
        songAlbum: selectedTrack.album?.name || "",
        songYear:
          selectedTrack.album?.release_date?.slice(0, 4) ||
          selectedTrack.songYear ||
          "",
        songAlbumCover: albumCoverUrl,
      });
    }
  };

  return (
    <Window
      title="Given that prompt, what song comes to mind?"
      footer={
        <div className="flex justify-between items-center w-full gap-3">
          <Button label="Back" href="/select-prompt" />

          {selectedTrack && (
            <Button
              label="Next"
              href="/add-message"
              onClick={handleNext}
            />
          )}
        </div>
      }
    >
      {/* Search */}
      <Form
        action="/select-song"
        className="flex flex-col sm:flex-row gap-2 w-full"
      >
        <input
          name="q"
          type="text"
          placeholder="Search tracks, artists..."
          className="border-2 p-2 rounded w-full min-w-0 text-black border-gray-300 shadow-inner shadow-black/40 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue={query || ""}
        />

        <SecondaryButton label="Search" type="submit" />
      </Form>

      {/* Results */}
      {(query || selectedTrack) && (
        <SearchResults
          tracks={tracks}
          selectedTrack={selectedTrack}
          onSelectTrack={setSelectedTrack}
        />
      )}
    </Window>
  );
}