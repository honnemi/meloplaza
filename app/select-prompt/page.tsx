"use client";

import Window from "@/components/Window";
import ProfilePreview from "@/components/ProfilePreview";
import Button from "@/components/Button";
import { useState } from "react";
import { useFormStore } from "@/app/context/FormContext";
import Avatar from "@/components/Avatar";

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
  const { formData, updateForm } = useFormStore();

  // Restore previously saved index if user navigates back
  const initialIndex = formData.prompt
    ? PROMPTS.indexOf(formData.prompt)
    : null;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    initialIndex !== -1 ? initialIndex : null
  );

  const handleNext = () => {
    if (selectedIndex !== null) {
      updateForm({ prompt: PROMPTS[selectedIndex] });
    }
  };

  const selectedPromptText =
    selectedIndex !== null ? PROMPTS[selectedIndex] : null;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start gap-10 p-6 sm:p-12 lg:flex-row lg:items-start lg:justify-start">
      {/* Show information from previous screens */}
      <ProfilePreview />

      <Window
        title="Now, which prompt catches your eye?"
        footer={
          <div className="flex justify-between w-full">
            <Button label="Back" href="/create-avatar" />

            {selectedIndex !== null && (
              <Button
                label="Next"
                href="/select-song"
                onClick={handleNext}
              />
            )}
          </div>
        }
      >
        <div className="w-full max-h-70 overflow-y-auto border-2 border-gray-300 rounded">
          {PROMPTS.map((promptText, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`w-full text-left text-md p-2 cursor-pointer ${selectedIndex === index
                ? "bg-blue-100 font-medium"
                : index % 2 === 0
                  ? "bg-gray-100 hover:bg-gray-200"
                  : "bg-white hover:bg-gray-200"
                }`}
            >
              {promptText}
            </button>
          ))}
        </div>
        {selectedPromptText !== null && (
          <>
            <h1 className="text-lg font-bold mt-4 mb-2 text-center text-gray-800">
              You selected:
            </h1>

            <p className="text-md italic text-center text-gray-600 min-h-6">
              "{selectedPromptText}"
            </p>
          </>
        )}
      </Window>
    </div>
  );
}