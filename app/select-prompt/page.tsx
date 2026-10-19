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

const CUSTOM_PROMPT = "✏️ Write my own prompt";

export default function PromptSelection() {
  const { formData, updateForm } = useFormStore();

  const savedPrompt = formData.prompt || "";
  const savedIndex = PROMPTS.indexOf(savedPrompt);
  const isSavedCustom = savedPrompt !== "" && savedIndex === -1;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    savedIndex >= 0 ? savedIndex : isSavedCustom ? PROMPTS.length : null,
  );

  const [customPrompt, setCustomPrompt] = useState(
    isSavedCustom ? savedPrompt : "",
  );

  const backHref = formData.editMode || formData.isEditing ? "/profile" : "/create-avatar";

  const isCustomSelected = selectedIndex === PROMPTS.length;

  const selectedPromptText =
    selectedIndex === null
      ? null
      : isCustomSelected
        ? customPrompt.trim()
        : PROMPTS[selectedIndex];

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

  function selectPrompt(index: number) {
    playClickSound();
    setSelectedIndex(index);

    if (index < PROMPTS.length) {
      updateForm({ prompt: PROMPTS[index] });
    } else {
      updateForm({ prompt: customPrompt.trim() });
    }
  }

  function handleCustomPromptChange(value: string) {
    setCustomPrompt(value);

    if (isCustomSelected) {
      updateForm({ prompt: value.trim() });
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start gap-10 p-6 sm:p-12 lg:flex-row">
      <ProfilePreview />

      <Window
        title="Select a prompt"
        footer={
          <div className="flex justify-between w-full">
            <Button label="Back" href={backHref} />

            {selectedPromptText && (
              <SecondaryButton label="Next" href="/select-song" />
            )}
          </div>
        }
      >
        {/* Prompt list */}
        <div className="w-full max-h-70 overflow-y-auto border-2 border-t-win-border-dark border-l-win-border-dark border-b-win-border-alt border-r-win-border-alt rounded-sm bg-white">
          {PROMPTS.map((promptText, index) => (
            <button
              key={promptText}
              type="button"
              onClick={() => selectPrompt(index)}
              className={`w-full text-left text-base p-2 cursor-pointer transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0097a7] ${
                selectedIndex === index
                  ? "bg-[#7ee3ea] font-medium shadow-[inset_3px_0_0_#0097a7,inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(0,90,100,0.25)]"
                  : `${index % 2 === 0 ? "bg-win" : "bg-white"} hover:bg-[#c9edf2] active:bg-[#b3e6ee]`
              }`}
            >
              {promptText}
            </button>
          ))}

          {/* Select custom prompt */}
          <button
            type="button"
            onClick={() => selectPrompt(PROMPTS.length)}
            className={`w-full text-left text-base p-2 cursor-pointer transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0097a7] ${
              isCustomSelected
                ? "bg-[#7ee3ea] font-medium shadow-[inset_3px_0_0_#0097a7,inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(0,90,100,0.25)]"
                : "bg-white hover:bg-[#c9edf2] active:bg-[#b3e6ee]"
            }`}
          >
            {CUSTOM_PROMPT}
          </button>
        </div>

        {/* Show text input for custom prompt */}
        {isCustomSelected && (
          <div className="flex flex-col gap-2 mt-4">
            <label
              htmlFor="custom-prompt"
              className="text-sm font-bold text-gray-600 font-heading"
            >
              Your Custom Prompt
            </label>

            <textarea
              id="custom-prompt"
              value={customPrompt}
              onChange={(event) => handleCustomPromptChange(event.target.value)}
              maxLength={80}
              placeholder="E.g. A song that is my go-to at karaoke"
              rows={3}
              className="w-full resize-none p-2 text-base bg-white border-2 border-t-win-border-dark border-l-win-border-dark border-b-win-border-alt border-r-win-border-alt rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0097a7] placeholder:text-gray-500"
            />

            <p className="text-xs text-gray-500 text-right">
              {customPrompt.length}/60 characters
            </p>
          </div>
        )}

        {/* Selected prompt */}
        {selectedPromptText && (
          <div className="flex flex-col items-center justify-center min-h-25">
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
