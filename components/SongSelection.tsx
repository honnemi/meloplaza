"use client";

import { useState } from "react";
import Window from "@/components/Window";
import Button, { SecondaryButton } from "@/components/Button";
import Form from "next/form";
import SearchResults from "@/components/SearchResults";

interface SongSelectionProps {
  tracks: any[];
  query?: string;
}

export default function SongSelection({
  tracks,
  query,
}: SongSelectionProps) {
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

  return (
    <Window
      title="3. Select your song"
      footer={
        <div className="flex justify-between w-full">
          {/* Back always shows */}
          <Button
            label="Back"
            href="/onboarding/select-prompt"
          />

          {/* Next only shows when a song is selected */}
          {selectedTrack && (
            <Button
              label="Next"
              href="/onboarding/complete"
            />
          )}
        </div>
      }
    >
      <Form
        action="/onboarding/select-song"
        className="flex gap-2"
      >
        <input
          name="q"
          type="text"
          placeholder="Search tracks, artists..."
          className="border p-2 rounded w-full text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          defaultValue={query || ""}
        />

        <SecondaryButton
          label="Search"
          type="submit"
        />
      </Form>

      {query && (
        <SearchResults
          tracks={tracks}
          selectedTrack={selectedTrack}
          onSelectTrack={setSelectedTrack}
        />
      )}
    </Window>
  );
}