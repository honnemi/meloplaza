"use client";

import Window from "@/components/Window";
import Button, { SecondaryButton, ColourButton } from "@/components/Button";
import Avatar from "@/components/Avatar";
import { useState } from "react";
import { useFormStore } from "@/app/context/FormContext";
import { AVATAR_FACES, AVATAR_COLOURS } from "../avatar-customisation";

export default function AvatarCreation() {
  const { formData, updateForm } = useFormStore();

  // Restore saved state from context if available, otherwise default to initial values
  const [faceIndex, setFaceIndex] = useState<number>(formData.faceIndex ?? 0);
  const [displayName, setDisplayName] = useState<string>(formData.displayName || "");
  const [colour, setColour] = useState<string>(formData.colour || AVATAR_COLOURS[0] || "#3B82F6");

  // Retrieve current face string using current faceIndex
  const face = AVATAR_FACES[faceIndex] || AVATAR_FACES[0];

  const handleRandomise = () => {
    const randomIndex = Math.floor(Math.random() * AVATAR_FACES.length);
    setFaceIndex(randomIndex);
  };

  const handleNext = () => {
    updateForm({
      faceIndex,
      displayName,
      colour,
    });
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <Window
        title="Let's customise your melo!"
        footer={
          <div className="flex justify-between w-full">
            <Button label="Back" href="/" />
            <Button label="Next" href="/select-prompt" onClick={handleNext} />
          </div>
        }
      >
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10 items-stretch w-full p-2">
          {/* Avatar preview */}
          <div className="flex flex-col items-center justify-center flex-1 w-full gap-4">
            <div className="flex flex-col items-center justify-center border-2 p-5 sm:p-6 rounded-sm shadow-inner shadow-black/40 w-full gap-3">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Preview
              </span>

              <Avatar colour={colour} faceIndex={faceIndex} />

              <span className="text-sm font-bold text-gray-800 text-center max-w-45 truncate h-5 mt-2">
                {displayName || "Anonymous"}
              </span>
            </div>

            <SecondaryButton
              label="Randomise Face"
              onClick={handleRandomise}
            />
          </div>

          {/* Customisation */}
          <div className="flex flex-col flex-1 justify-center gap-6 w-full">
            {/* Display name */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2">
                Display name
              </h3>

              <input
                name="name-input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
                className="border-2 p-2 rounded w-full text-black border-gray-300 shadow-inner shadow-black/40 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Colours */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">
                Select Colour
              </h3>

              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-3 w-full">
                {AVATAR_COLOURS.map((hex) => (
                  <div key={hex} className="flex justify-center">
                    <ColourButton
                      colour={hex}
                      onClick={() => setColour(hex)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Window>
    </div>
  );
}