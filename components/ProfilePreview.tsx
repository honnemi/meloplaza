"use client";

import { useFormStore } from "@/app/context/FormContext";
import Avatar from "@/components/Avatar";
import Window from "@/components/Window";

export default function ProfilePreview() {
  const { formData } = useFormStore();

  return (
    <Window
      title="Your Profile"
      className="w-[60%] h-auto"
      contentClassName="p-3"
    >
      <div className="flex flex-col items-center md:flex-row md:items-start gap-3 w-full">

        {/* Avatar preview */}
        <div className="w-30 h-30 shrink-0 flex flex-col items-center justify-center border-2 p-1 rounded-sm shadow-inner shadow-black/40 gap-1">
          <span className="text-[10px] font-bold text-gray-800 text-center max-w-20 break-words">
            {formData.displayName || "Anonymous"}
          </span>

          <Avatar
            colour={formData.colour}
            faceIndex={formData.faceIndex}
            size="size-14"
            textSize="text-xl"
          />
        </div>

        {/* Profile information */}
        <div className="w-full min-w-0 flex-1">
          <div className="space-y-2 text-gray-700">

            {/* Selected Prompt */}
            <div className="border border-gray-200 p-2 rounded bg-gray-50">
              <h2 className="font-semibold text-[9px] text-gray-500 uppercase tracking-wide mb-0.5">
                Prompt
              </h2>

              {formData.prompt ? (
                <p className="text-xs italic text-gray-800 break-words">
                  "{formData.prompt}"
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  No prompt selected
                </p>
              )}
            </div>

            {/* Chosen Song */}
            <div className="border border-gray-200 p-2 rounded bg-gray-50">
              <h2 className="font-semibold text-[9px] text-gray-500 uppercase tracking-wide mb-1">
                Song
              </h2>

              {formData.songName ? (
                <div className="flex items-center gap-2">
                  {formData.songAlbumCover ? (
                    <img
                      src={formData.songAlbumCover}
                      alt={formData.songAlbum || "Album cover"}
                      className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-[8px] shrink-0">
                      No Cover
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 break-words">
                      {formData.songName}
                    </p>

                    <p className="text-[10px] text-gray-600 break-words">
                      {formData.songArtist}{" "}
                      {formData.songYear
                        ? `(${formData.songYear})`
                        : ""}
                    </p>

                    {formData.songAlbum && (
                      <p className="text-[10px] text-gray-500 italic break-words">
                        {formData.songAlbum}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">
                  No song selected
                </p>
              )}
            </div>

            {/* Personal Message */}
            <div className="border border-gray-200 p-2 rounded bg-gray-50">
              <h2 className="font-semibold text-[9px] text-gray-500 uppercase tracking-wide mb-0.5">
                Message
              </h2>

              {formData.message ? (
                <p className="text-xs text-gray-800 whitespace-pre-wrap break-words">
                  {formData.message}
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  No message
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </Window>
  );
}
