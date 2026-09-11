"use client";

import Window from "@/components/Window";
import Button from "@/components/Button";
import { useState } from "react";
import { useFormStore } from "@/app/context/FormContext";
import ProfilePreview from "@/components/ProfilePreview";

export default function AddMessage() {
  const { formData, updateForm } = useFormStore();

  // Restore existing message from FormContext if present
  const [message, setMessage] = useState<string>(formData.message || "");
  const characterLimit = 300;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;

    if (inputValue.length <= characterLimit) {
      setMessage(inputValue);
    }
  };

  const handleNext = () => {
    updateForm({ message });
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start gap-10 p-6 sm:p-12 lg:flex-row lg:items-start lg:justify-start">
      <ProfilePreview></ProfilePreview> 
      <Window
        title="Write a personal message to go with it!"
        footer={
          <div className="flex justify-between w-full">
            <Button label="Back" href="/select-song" />
            {message.trim().length !== 0 && (
              <Button label="Next" href="/confirm-new-user" onClick={handleNext} />
            )}
          </div>
        }
      >

        <p className="text-md italic text-center mb-4 text-gray-600 min-h-6">
          Relate back to your prompt. Why this song in particular?
        </p>

        <textarea
          className="w-full border-2 rounded-sm p-4 text-black focus:outline-none border-gray-200 shadow-inner shadow-black/40 transition-all duration-150 focus:border-blue-500"
          rows={8}
          placeholder="Enter message..."
          value={message}
          onChange={handleChange}
          maxLength={characterLimit}
        />

        <div className="flex flex-row justify-end mt-2">
          {/* Dynamic text color: turns red at 300 characters */}
          <span
            className={`text-sm transition-all duration-150 ${
              message.length >= characterLimit
                ? "text-red-500 font-semibold"
                : "text-gray-600"
            }`}
          >
            {message.length}/{characterLimit}
          </span>
        </div>
      </Window>
    </div>
  );
}