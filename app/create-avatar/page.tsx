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
  const [displayName, setDisplayName] = useState<string>(
    formData.displayName || "",
  );
  const [colour, setColour] = useState<string>(
    formData.colour || AVATAR_COLOURS[0] || "#3B82F6",
  );

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

  // Enforce character limit for display name
  const characterLimit = 30;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue.length <= characterLimit) {
      setDisplayName(inputValue);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <Window
        title="First, let's customise your melo!"
        footer={
          <div className="flex justify-between w-full">
            <Button label="Back" href="/" />
            <Button label="Next" href="/select-prompt" onClick={handleNext} />
          </div>
        }
      >
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch w-full p-2">
          {/* Left side */}
          <div className="flex flex-col flex-1 w-full gap-4">
            {/* Display name */}
            <div className="w-full">
              <h3 className="text-sm font-bold text-gray-700 mb-2">
                Display Name
              </h3>

              <input
                name="name-input"
                type="text"
                value={displayName}
                onChange={handleChange}
                placeholder="Enter display name"
                className="text-input"
              />

              <div className="flex flex-row justify-end mt-2">
                <span
                  className={`text-sm transition-all duration-150 ${
                    displayName.length >= characterLimit
                      ? "text-red-500 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {displayName.length}/{characterLimit}
                </span>
              </div>
            </div>

            {/* Colours */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-4">
                Colour Select
              </h3>

              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-3 w-full">
                {AVATAR_COLOURS.map((hex) => (
                  <div key={hex} className="flex justify-center">
                    <ColourButton colour={hex} onClick={() => setColour(hex)} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex flex-col flex-1 w-full items-center justify-center gap-4">
            {/* Avatar preview */}
            <div className="flex flex-col w-60 h-60 items-center justify-center border-2 border-gray-300 p-5 sm:p-6 rounded-sm gap-3">
              <span className="text-sm font-bold text-gray-800 text-center max-w-45 truncate h-5 mt-2">
                {displayName || "Anonymous"}
              </span>

              <Avatar colour={colour} faceIndex={faceIndex} />
            </div>

            {/* Randomise button */}
            <div className="flex justify-center">
              <SecondaryButton
                label="Randomise Face"
                icon={<i className="hn hn-shuffle-solid"></i>}
                onClick={handleRandomise}
              />
            </div>
          </div>
          
        </div>
      </Window>
    </div>
  );
}
