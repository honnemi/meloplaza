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

export default function SongSelection({ tracks, query }: SongSelectionProps) {
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

  // Play sound on click
  function playClickSound() {
    if (typeof window !== "undefined") {
      const clickAudio = new Audio("/assets/click.mp3");
      clickAudio.volume = 0.5;
      clickAudio.play().catch((err) => console.error("Audio blocked by browser:", err));
    }
  }

  // Save the selected song to the shared form state
  const handleSelectTrack = (track: any) => {
    setSelectedTrack(track);
    playClickSound();

    const albumCoverUrl =
      track.album?.images?.[0]?.url || track.albumCover || "";

    updateForm({
      songId: track.id,
      songName: track.name,
      songArtist: track.artists?.[0]?.name || "",
      songAlbum: track.album?.name || "",
      songYear: track.album?.release_date?.slice(0, 4) || "",
      songAlbumCover: albumCoverUrl,
      songDuration: track.duration_ms || 0,
    });
  };

  // Play sound on type
  function playTypeSound() {
    if (typeof window !== "undefined") {
      const typeAudio = new Audio("/assets/type.mp3");
      typeAudio.volume = 0.2;
      typeAudio.play().catch((err) => console.error("Audio blocked by browser:", err));
    }
  }

  return (
    <Window
      title="Given the prompt, what song comes to mind?"
      footer={
        <div className="flex justify-between items-center w-full">
          <Button label="Back" href="/select-prompt" />

          {selectedTrack && <Button label="Next" href="/add-message" />}
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
            type="search"
            placeholder="Search tracks, artists..."
            className="text-input"
            defaultValue={query || ""}
            onChange={() => playTypeSound()}
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
