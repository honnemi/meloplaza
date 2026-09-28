"use client";

import Window from "@/components/Window";
import Button, { SecondaryButton } from "@/components/Button";
import Avatar from "@/components/Avatar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/app/context/FormContext";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmNewUserPage() {
  const router = useRouter();
  const { formData, clearForm } = useFormStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Force a clean session so testing multiple users generates distinct IDs
      await supabase.auth.signOut();

      // Execute anonymous sign-in to get a fresh user session
      const { data, error: anonError } =
        await supabase.auth.signInAnonymously();

      if (anonError) {
        console.error("Supabase Anonymous Sign-In Error:", anonError);
        throw new Error(`Auth failed: ${anonError.message}`);
      }

      const userId = data?.user?.id || data?.session?.user?.id;

      if (!userId) {
        throw new Error("Failed to retrieve user ID after anonymous sign-in.");
      }

      // Post to API route
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();

        throw new Error(errorData.error || "Failed to save profile.");
      }

      clearForm();
      router.push("/plaza");
    } catch (err: any) {
      console.error("Submission catch block:", err);

      setError(err.message || "An unexpected error occurred.");

      setLoading(false);
    }
  };

  // Show the plain loading screen while submitting
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center font-heading text-2xl font-bold cursor-wait">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 sm:p-12">
      <Window
        title="Ready to enter?"
        footer={
          <div className="flex justify-between w-full items-center gap-3">
            <Button label="Back" href="/add-message" disabled={loading} />

            <SecondaryButton
              label="Confirm"
              onClick={handleConfirm}
              disabled={loading}
            />
          </div>
        }
      >
        <h1 className="text-lg font-bold mb-4 text-center text-gray-700">
          Make sure you're happy with what you've chosen!
        </h1>

        {error && (
          <div className="mb-4 p-3 text-sm text-[#a80f35] bg-[#ffe3ea] rounded-sm border-2 border-[#ff9bb0] text-center">
            {error}
          </div>
        )}

        <div className="space-y-3 pr-2 text-gray-900 overflow-y-hidden">
          {/* Avatar */}
          <div className="border-2 border-win-border-alt p-3 rounded-sm bg-white">
            <h2 className="font-semibold text-xs text-gray-600 uppercase tracking-wide mb-2">
              Avatar
            </h2>

            <div className="flex items-center gap-3">
              <Avatar
                colour={formData.colour || "#00c3d0"}
                faceIndex={formData.faceIndex}
                size="size-14"
                textSize="text-l"
              />

              <p className="font-bold text-gray-900 wrap-break-word min-w-0">
                {formData.displayName || "Anonymous"}
              </p>
            </div>
          </div>

          {/* Selected prompt */}
          <div className="border-2 border-win-border-alt p-3 rounded-sm bg-white">
            <h2 className="font-semibold text-xs text-gray-600 uppercase tracking-wide mb-1">
              Prompt
            </h2>

            {formData.prompt ? (
              <p className="italic text-gray-900 wrap-break-word">
                "{formData.prompt}"
              </p>
            ) : (
              <p className="italic text-gray-500">No prompt selected</p>
            )}
          </div>

          {/* Chosen song */}
          <div className="border-2 border-win-border-alt p-3 rounded-sm bg-white">
            <h2 className="font-semibold text-xs text-gray-600 uppercase tracking-wide mb-2">
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
                  <p className="text-gray-900 wrap-break-word">
                    {formData.songName}
                  </p>

                  <p className="text-sm text-gray-700 wrap-break-word">
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
              <p className="italic text-gray-500">No song selected</p>
            )}
          </div>

          {/* Personal message */}
          <div className="border-2 border-win-border-alt p-3 rounded-sm bg-white">
            <h2 className="font-semibold text-xs text-gray-600 uppercase tracking-wide mb-1">
              Message
            </h2>

            {formData.message ? (
              <p className="text-gray-900 whitespace-pre-wrap wrap-break-word">
                {formData.message}
              </p>
            ) : (
              <p className="italic text-gray-500">No message added</p>
            )}
          </div>
        </div>
      </Window>
    </div>
  );
}
