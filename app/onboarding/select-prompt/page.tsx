"use client";

import Window from "@/components/Window";
import Button from "@/components/Button";
import { useState } from "react";

const PROMPTS = [
  "A song I'm embarrassed to admit I love",
  "A song that reminds me of someone I miss",
  "A song from a language I don't speak but love anyway",
  "A song that got me through a hard time",
  "A song that reminds me of a specific place",
  "A song I associate with a season or time of year",
  "A song that makes me feel understood",
  "A song I think is criminally underrated",
  "A song I grew up listening to",
  "A song I'd play for a stranger to explain my taste in music",
];

export default function PromptSelection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedPromptText =
    selectedIndex !== null ? PROMPTS[selectedIndex] : null;

  return (
    <Window
      title="2. Select a prompt"
      footer={
        <div className="flex justify-between w-full">
          <Button label="Back" href="/onboarding/create-avatar" />
          {selectedIndex !== null && <Button label="Next" href="/onboarding/select-song" />}
        </div>
      }
    >
      <h1 className="text-xl font-bold mb-2 text-center text-black">
        You selected:
      </h1>

      <p className="text-md italic text-center mb-4 text-gray-600 min-h-[1.5rem]">
        {selectedPromptText ? `"${selectedPromptText}"` : "Select a prompt."}
      </p>

      <div className="w-full max-h-70 overflow-y-auto border border-gray-300 rounded">
        {PROMPTS.map((promptText, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={`w-full text-left text-md p-2 cursor-pointer ${
              selectedIndex === index ? "bg-blue-100" : "hover:bg-gray-200"
            }`}
          >
            {promptText}
          </button>
        ))}
      </div>
    </Window>
  );
}
