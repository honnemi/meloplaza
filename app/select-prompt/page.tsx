"use client";

import Window from "@/components/Window";
import ProfilePreview from "@/components/ProfilePreview";
import Button, { SecondaryButton } from "@/components/Button";
import { useState } from "react";
import { useFormStore } from "@/app/context/FormContext";

const PROMPTS = [
  "🫣 A song I'm embarrassed to admit I love",
  "💭 A song that reminds me of someone I miss",
  "🌎 A song from a language I don't speak but love anyway",
  "🩹 A song that got me through a hard time",
  "📍 A song that reminds me of a specific place",
  "🍂 A song I associate with a season or time of year",
  "🪞 A song that makes me feel understood",
  "💎 A song I think is criminally underrated",
  "🧸 A song I grew up listening to",
  "💿 A song I'd play for a stranger to explain my taste in music",
];

export default function PromptSelection() {
  const { formData, updateForm } = useFormStore();

  // Restore previously saved prompt if user navigates back
  const initialIndex = formData.prompt
    ? PROMPTS.indexOf(formData.prompt)
    : null;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    initialIndex !== -1 ? initialIndex : null,
  );

  const selectedPromptText =
    selectedIndex !== null ? PROMPTS[selectedIndex] : null;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start gap-10 p-6 sm:p-12 lg:flex-row">
      {/* Show choices from previous pages */}
      <ProfilePreview />

      <Window
        title="Select a prompt"
        footer={
          <div className="flex justify-between w-full">
            <Button label="Back" href="/create-avatar" />

            {selectedIndex !== null && (
              <SecondaryButton label="Next" href="/select-song" />
            )}
          </div>
        }
      >
        <div className="w-full max-h-70 overflow-y-auto border-2 border-t-win-border-dark border-l-win-border-dark border-b-win-border-alt border-r-win-border-alt rounded-sm bg-white">
          {PROMPTS.map((promptText, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setSelectedIndex(index);
                updateForm({ prompt: promptText });
              }}
              className={`w-full text-left text-base p-2 cursor-pointer transition-colors duration-100
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0097a7] ${
          selectedIndex === index
            ? "bg-[#7ee3ea] font-medium shadow-[inset_3px_0_0_#0097a7,inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(0,90,100,0.25)]"
            : `${index % 2 === 0 ? "bg-win" : "bg-white"} hover:bg-[#c9edf2] active:bg-[#b3e6ee]`
        }`}
            >
              {promptText}
            </button>
          ))}
        </div>
        {selectedPromptText !== null && (
          <div className="flex flex-col items-center justify-center h-25">
            <h1 className="text-lg font-bold mt-4 mb-2 text-center text-gray-600">
              Selected Prompt
            </h1>

            <p className="text-base italic text-center min-h-6">
              "{selectedPromptText}"
            </p>
          </div>
        )}
      </Window>
    </div>
  );
}
