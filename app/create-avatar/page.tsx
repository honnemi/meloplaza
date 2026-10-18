"use client";

import Window from "@/components/Window";
import Button, { SecondaryButton, ColourButton } from "@/components/Button";
import Avatar from "@/components/Avatar";
import { useState } from "react";
import { useFormStore } from "@/app/context/FormContext";
import { AVATAR_FACES, AVATAR_COLOURS } from "../avatar-customisation";
import { useTransitionRouter } from "next-view-transitions";

export default function AvatarCreation() {
  const { formData, updateForm, clearForm } = useFormStore();
  const router = useTransitionRouter();

  // Restore from form data if available, otherwise default to initial values
  const [faceIndex, setFaceIndex] = useState<number>(formData.faceIndex ?? 0);
  const [displayName, setDisplayName] = useState<string>(
    formData.displayName || "",
  );
  const [colour, setColour] = useState<string>(
    formData.colour || AVATAR_COLOURS[0] || "#3B82F6",
  );

  // Play sound on click/action
  function playClickSound() {
    if (typeof window !== "undefined") {
      const clickAudio = new Audio("/assets/click.mp3");
      clickAudio.volume = 0.2;
      clickAudio
        .play()
        .catch((err) => console.error("Audio blocked by browser:", err));
    }
  }

  // Handle face next
  const handleFaceNext = () => {
    playClickSound();
    if (faceIndex >= 0 && faceIndex < AVATAR_FACES.length - 1) {
      setFaceIndex(faceIndex + 1);
    }
  };

  const nextHref =
    formData.editMode === "melo" ? "/confirm-profile" : "/select-prompt";

  const backHref =
  formData.editMode || formData.isEditing
    ? "/profile"
    : "/";

  // Handle face back
  const handleFaceBack = () => {
    playClickSound();
    if (faceIndex > 0) {
      setFaceIndex(faceIndex - 1);
    }
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

  // Enforce character limit for display name
  const characterLimit = 20;

  // Handle display name input change and update form data
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    playTypeSound();
    const inputValue = e.target.value;

    if (inputValue.length <= characterLimit) {
      setDisplayName(inputValue);
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden flex items-center justify-center p-6 sm:p-12">
      <Window
        title="Customise your Melo"
        footer={
          <div className="flex justify-between w-full">
            <Button
              label="Back"
              href={backHref}
              onClick={() => {
                if (!formData.editMode) clearForm();
              }}
            />

            <SecondaryButton
              label="Next"
              href={nextHref}
              onClick={() => updateForm({ faceIndex, displayName, colour })}
            />
          </div>
        }
      >
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch w-full p-2">
          {/* Left side */}
          <div className="flex flex-col flex-1 w-full gap-4">
            {/* Display name */}
            <div className="w-full">
              <h3 className="text-sm font-bold text-gray-600 mb-2">
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

              {/* Character limit */}
              <div className="flex flex-row justify-end mt-2">
                <span
                  className={`text-sm transition-all duration-150 ${
                    displayName.length >= characterLimit
                      ? "text-[#FF2D55]"
                      : "text-gray-600"
                  }`}
                >
                  {displayName.length}/{characterLimit}
                </span>
              </div>
            </div>

            {/* Colours */}
            <div>
              <h3 className="text-sm font-bold text-gray-600 mb-2">
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
            <div className="bg-white flex flex-col w-60 h-60 items-center justify-center border-2 border-win-border-alt p-5 sm:p-6 rounded-sm">
              <span className="text-sm font-bold text-center max-w-45 min-h-10 leading-5 wrap-break-word text-gray-800">
                {displayName || "Anonymous"}
              </span>
              <Avatar colour={colour} faceIndex={faceIndex} />
            </div>

            {/* Styled face selection buttons */}
            <div className="flex flex-row gap-4 w-65">
              <button
                type="button"
                onClick={handleFaceBack}
                className="flex-1 px-4 py-2.5 text-sm font-bold border-2 border-win-border-dark rounded-sm bg-win-alt shadow-[3px_3px_0px_rgba(0,90,100,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] cursor-pointer text-gray-800 font-heading flex items-center justify-center gap-2 transition-transform"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
                }}
              >
                <i className="hn hn-arrow-left-solid text-xs"></i> Prev Face
              </button>

              <button
                type="button"
                onClick={handleFaceNext}
                className="flex-1 px-4 py-2.5 text-sm font-bold border-2 border-win-border-dark rounded-sm bg-win-alt shadow-[3px_3px_0px_rgba(0,90,100,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] cursor-pointer text-gray-800 font-heading flex items-center justify-center gap-2 transition-transform"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
                }}
              >
                Next Face <i className="hn hn-arrow-right-solid text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </Window>
    </div>
  );
}
