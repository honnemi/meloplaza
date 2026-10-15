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

  // Restore selected song from form data if available
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
      clickAudio.volume = 0.2;
      clickAudio
        .play()
        .catch((err) => console.error("Audio blocked by browser:", err));
    }
  }

  // Save selected song to form data and update state
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
      typeAudio
        .play()
        .catch((err) => console.error("Audio blocked by browser:", err));
    }
  }

  return (
    <Window
      title="Given the prompt, what song comes to mind?"
      footer={
        <div className="flex justify-between items-center w-full">
          <Button label="Back" href="/select-prompt" />

          {selectedTrack && <SecondaryButton label="Next" href="/add-message" />}
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

          <button
                type="submit"
                className="flex-1 px-4 py-2.5 text-sm font-bold border-2 border-win-border-dark rounded-sm bg-win-alt shadow-[3px_3px_0px_rgba(0,90,100,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] cursor-pointer text-gray-800 font-heading flex items-center justify-center gap-2 transition-transform"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
                }}
              >
                <i className="hn hn-search"></i> Search
              </button>
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
