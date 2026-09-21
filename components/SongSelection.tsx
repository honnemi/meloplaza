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

  // Restore previously selected song when coming back to this page
  useEffect(() => {
    if (formData.songId && !selectedTrack) {
      setSelectedTrack({
        id: formData.songId,
        name: formData.songName,
        duration_ms: formData.songDuration, 
        artists: [
          {
            name: formData.songArtist,
          },
        ],
        album: {
          name: formData.songAlbum,
          release_date: formData.songYear,
          images: formData.songAlbumCover
            ? [{ url: formData.songAlbumCover }]
            : [],
        },
      });
    }
  }, [formData.songId]);

  // Save the selected song to the shared form state immediately
  const handleSelectTrack = (track: any) => {
    setSelectedTrack(track);

    const albumCoverUrl =
      track.album?.images?.[0]?.url ||
      track.albumCover ||
      "";

    updateForm({
      songId: track.id,
      songName: track.name,
      songArtist: track.artists?.[0]?.name || "",
      songAlbum: track.album?.name || "",
      songYear: track.album?.release_date?.slice(0, 4) || "",
      songAlbumCover: albumCoverUrl,
      songDuration: track.duration_ms || 0 
    });
  };

  return (
    <Window
      title="Given the prompt, what song comes to mind?"
      footer={
        <div className="flex justify-between items-center w-full">
          <Button label="Back" href="/select-prompt" />

          {selectedTrack && (
            <Button
              label="Next"
              href="/add-message"
            />
          )}
        </div>
      }
    >
      <div className="w-full min-w-0">
        {/* Search */}
        <Form
          action="/select-song"
          className="flex flex-col sm:flex-row gap-2 w-full"
        >
          <input
            name="q"
            type="text"
            placeholder="Search tracks, artists..."
            className="text-input"
            defaultValue={query || ""}
          />

          <SecondaryButton
            label="Search"
            icon={<i className="hn hn-search"></i>}
            type="submit"
          />
        </Form>

        {/* Results */}
        {(query || selectedTrack) && (
          <SearchResults
            tracks={tracks}
            selectedTrack={selectedTrack}
            onSelectTrack={handleSelectTrack}
          />
        )}
      </div>
    </Window>
  );
}

