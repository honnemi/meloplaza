"use client";

import Window from "@/components/Window";
import Button from "@/components/Button";
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
      const { data, error: anonError } = await supabase.auth.signInAnonymously();

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 sm:p-12">
      <Window
        title="Are you ready to enter?"
        footer={
          <div className="flex justify-between w-full items-center gap-3">
            <Button label="Back" href="/add-message" disabled={loading} />
            <Button
              label={loading ? "Submitting..." : "Confirm"}
              onClick={handleConfirm}
              disabled={loading}
            />
          </div>
        }
      >
        <h1 className="text-lg font-bold mb-4 text-center text-gray-800">
          Double-check your profile before submitting:
        </h1>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded border border-red-300 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4 max-h-96 pr-2 text-gray-700">
          {/* Profile */}
          <div className="border border-gray-200 p-3 rounded bg-gray-50">
            <h2 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-1">
              Profile
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 overflow-hidden shrink-0">
                <div className="scale-[0.35] transform origin-center">
                  <Avatar
                    colour={formData.colour || "#3b82f6"}
                    faceIndex={formData.faceIndex}
                  />
                </div>
              </div>
              <p className="font-bold text-gray-800">
                {formData.displayName || "Anonymous"}
              </p>
            </div>
          </div>

          {/* Selected Prompt */}
          <div className="border border-gray-200 p-3 rounded bg-gray-50">
            <h2 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-1">
              Selected Prompt
            </h2>
            {formData.prompt ? (
              <p className="italic text-gray-800">"{formData.prompt}"</p>
            ) : (
              <p className="text-gray-400">No prompt selected</p>
            )}
          </div>

          {/* Chosen Song */}
          <div className="border border-gray-200 p-3 rounded bg-gray-50">
            <h2 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-2">
              Chosen Song
            </h2>
            {formData.songName ? (
              <div className="flex items-center gap-3">
                {formData.songAlbumCover ? (
                  <img
                    src={formData.songAlbumCover}
                    alt={formData.songAlbum || "Album cover"}
                    className="w-14 h-14 rounded object-cover border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs shrink-0">
                    No Cover
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-800">{formData.songName}</p>
                  <p className="text-sm text-gray-600">
                    {formData.songArtist}{" "}
                    {formData.songYear ? `(${formData.songYear})` : ""}
                  </p>
                  {formData.songAlbum && (
                    <p className="text-xs text-gray-500 italic">
                      {formData.songAlbum}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No song selected</p>
            )}
          </div>

          {/* Personal Message */}
          <div className="border border-gray-200 p-3 rounded bg-gray-50">
            <h2 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-1">
              Personal Message
            </h2>
            {formData.message ? (
              <p className="text-gray-800 whitespace-pre-wrap">{formData.message}</p>
            ) : (
              <p className="text-gray-400">No message added</p>
            )}
          </div>
        </div>
      </Window>
    </div>
  );
}