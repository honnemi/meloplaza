"use client";

import { useState } from "react";
import Window from "@/components/Window";
import Button, { SecondaryButton } from "@/components/Button";
import Avatar from "@/components/Avatar";
import { useTransitionRouter } from "next-view-transitions";
import { useFormStore } from "@/app/context/FormContext";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmNewUserPage() {
  const router = useTransitionRouter();
  const { formData: liveFormData, clearForm } = useFormStore();

  const [snapshot, setSnapshot] = useState<typeof liveFormData | null>(null);
  const formData = snapshot ?? liveFormData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editMode = formData.editMode;
  const isEditing = editMode !== null || formData.isEditing === true;
  const isMeloConfirmation = editMode === "melo";

  const returnTo = formData.returnTo || "/profile";

  // If editing, return to profile, else, return to previous page (add-message)
  const backHref =
    formData.editMode || formData.isEditing ? returnTo : "/add-message";

  // On confirm, send API request to update user profile
  const handleConfirm = async () => {
    if (loading) return;

    setSnapshot(liveFormData);
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      if (isEditing) {
        if (!editMode) {
          throw new Error("Please restart the edit flow from your profile.");
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const userId = session?.user?.id;

        if (!userId) {
          throw new Error("No active user session found.");
        }

        const response = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            userId,
            editMode,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to save changes.");
        }

        clearForm();
        router.push(returnTo);
        return;
      }

      await supabase.auth.signOut();

      const { data, error: signInError } =
        await supabase.auth.signInAnonymously();

      if (signInError) {
        throw new Error(`Auth failed: ${signInError.message}`);
      }

      const userId = data.user?.id || data.session?.user?.id;

      if (!userId) {
        throw new Error("Failed to retrieve user ID.");
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save profile.");
      }

      clearForm();
      router.push("/plaza");
    } catch (err: unknown) {
      console.error("Profile submission failed:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
      setSnapshot(null);
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 sm:p-12">
      <Window
        title={isEditing ? "Save changes?" : "Ready to enter?"}
        contentClassName="p-4 sm:p-6"
        footer={
          <div className="flex justify-between w-full items-center gap-3">
            <Button
              label={isEditing ? "Cancel" : "Back"}
              href={backHref}
              disabled={loading}
            />
            <SecondaryButton
              label={loading ? "Saving..." : isEditing ? "Save" : "Confirm"}
              onClick={handleConfirm}
              disabled={loading}
            />
          </div>
        }
      >
        {/* Confirmation message */}
        <div className="text-base sm:text-lg italic mb-4 text-center text-gray-600">
          {isMeloConfirmation || editMode === "recommendation"
            ? "Review your changes before saving."
            : "You can always update your profile later!"}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 text-sm text-[#a80f35] bg-[#ffe3ea] rounded-sm border-2 border-[#ff9bb0] text-center">
            {error}
          </div>
        )}

        {/* User profile */}
        {isMeloConfirmation ? (
          <div className="flex flex-col items-center justify-center py-2 sm:py-6">
            <div className="flex flex-col items-center gap-4 sm:gap-5 w-full">
              <div className="w-36 h-36 sm:w-56 sm:h-56 flex items-center justify-center border-2 border-win-border-alt rounded-sm bg-white shadow-sm">
                <Avatar
                  colour={formData.colour || "#00c3d0"}
                  faceIndex={formData.faceIndex}
                  size="size-28 sm:size-40"
                  textSize="text-4xl sm:text-5xl"
                />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center wrap-break-word max-w-full min-w-0">
                {formData.displayName || "Anonymous"}
              </h2>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:pr-2 overflow-y-auto max-h-[55dvh] sm:max-h-[60vh]">
            {editMode !== "recommendation" && (
              <div className="border-2 border-win-border-alt p-3 rounded-sm bg-white">
                <h2 className="font-semibold text-xs text-gray-600 uppercase mb-2">
                  Melo
                </h2>
                <div className="flex items-center gap-3">
                  <Avatar
                    colour={formData.colour || "#00c3d0"}
                    faceIndex={formData.faceIndex}
                    size="size-14"
                    textSize="text-l"
                  />
                  <p className="font-bold text-gray-800 wrap-break-word min-w-0 flex-1">
                    {formData.displayName || "Anonymous"}
                  </p>
                </div>
              </div>
            )}

            <div className="border-2 border-win-border-alt p-3 rounded-sm bg-white">
              <h2 className="font-semibold text-xs text-gray-600 uppercase mb-1">
                Prompt
              </h2>
              {formData.prompt ? (
                <p className="italic wrap-break-word">"{formData.prompt}"</p>
              ) : (
                <p className="italic text-gray-400">No prompt selected</p>
              )}
            </div>

            <div className="border-2 border-win-border-alt p-3 rounded-sm bg-white">
              <h2 className="font-semibold text-xs text-gray-600 uppercase mb-2">
                Song
              </h2>
              {formData.songName ? (
                <div className="flex items-center gap-3">
                  {formData.songAlbumCover ? (
                    <img
                      src={formData.songAlbumCover}
                      alt={formData.songAlbum || "Album cover"}
                      className="w-14 h-14 rounded object-cover border border-gray-300 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-600 text-xs shrink-0">
                      No Cover
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="wrap-break-word">{formData.songName}</p>
                    <p className="text-sm text-gray-600 wrap-break-word">
                      {formData.songArtist}{" "}
                      {formData.songYear ? `(${formData.songYear})` : ""}
                    </p>
                    {formData.songAlbum && (
                      <p className="text-xs text-gray-600 italic wrap-break-word">
                        {formData.songAlbum}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="italic text-gray-400">No song selected</p>
              )}
            </div>

            <div className="border-2 border-win-border-alt p-3 rounded-sm bg-white">
              <h2 className="font-semibold text-xs text-gray-600 uppercase mb-1">
                Message
              </h2>
              {formData.message ? (
                <p className="whitespace-pre-wrap wrap-break-word">
                  {formData.message}
                </p>
              ) : (
                <p className="italic text-gray-400">No message added</p>
              )}
            </div>
          </div>
        )}
      </Window>
    </div>
  );
}