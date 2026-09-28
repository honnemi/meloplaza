"use client";

import Window from "@/components/Window";
import Button from "@/components/Button";
import { useFormStore } from "@/app/context/FormContext";
import ProfilePreview from "@/components/ProfilePreview";

export default function AddMessage() {
  const { formData, updateForm } = useFormStore();

  const characterLimit = 300;
  const message = formData.message || "";

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;

    if (inputValue.length <= characterLimit) {
      updateForm({
        message: inputValue,
      });
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start gap-10 p-6 sm:p-12 lg:flex-row">

      {/* Show choices from previous pages */}
      <ProfilePreview />

      <Window
        title="Write a personal message"
        footer={
          <div className="flex justify-between w-full">
            <Button label="Back" href="/select-song" />

            {message.trim().length !== 0 && (
              <Button
                label="Next"
                href="/confirm-new-user"
              />
            )}
          </div>
        }
      >
        <p className="text-md italic text-center mb-4 text-gray-600 min-h-6">
          Relate back to the prompt. Why this song in particular?
        </p>

        {/* Text input */}
        <textarea
          className="w-full rounded-sm p-4 text-black focus:outline-none border-2 border-gray-500 border-t-gray-600 border-l-gray-600 border-b-gray-300 border-r-gray-300 transition-all duration-150 focus:border-blue-500"
          rows={8}
          placeholder="Enter message..."
          value={message}
          onChange={handleChange}
          maxLength={characterLimit}
        />

        {/* Character limit */}
        <div className="flex flex-row justify-end mt-2">
          <span
            className={`text-sm transition-all duration-150 ${
              message.length >= characterLimit
                ? "text-red-500"
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
