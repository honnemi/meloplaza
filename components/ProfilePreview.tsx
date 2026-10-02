"use client";

import { useFormStore } from "@/app/context/FormContext";
import Avatar from "@/components/Avatar";
import Window from "@/components/Window";

export default function ProfilePreview() {
  const { formData } = useFormStore();

  return (
    <Window title="Your ID" className="w-[60%] h-auto" contentClassName="p-3">
      <div className="flex flex-col items-center md:flex-row md:items-start gap-3 w-full">
        {/* Avatar preview */}
        <div className="bg-white w-30 h-30 shrink-0 flex flex-col items-center justify-center border-2 border-win-border-alt rounded-sm gap-2">
          <span className="text-[10px] font-bold text-center max-w-20 wrap-break-word text-gray-800">
            {formData.displayName || "Anonymous"}
          </span>

          <Avatar
            colour={formData.colour}
            faceIndex={formData.faceIndex}
            size="size-14"
            textSize="text-l"
          />
        </div>

        {/* Profile information */}
        <div className="w-full min-w-0 flex-1">
          <div className="space-y-2">
            {/* Selected prompt */}
            <div className="border-2 border-win-border-alt p-2 rounded-sm bg-white">
              <h2 className="font-semibold text-[9px] text-gray-600 uppercase mb-0.5">
                Prompt
              </h2>

              {formData.prompt ? (
                <p className="text-xs italic wrap-break-word">
                  "{formData.prompt}"
                </p>
              ) : (
                <p className="text-xs italic text-gray-400">
                  No prompt selected
                </p>
              )}
            </div>

            {/* Chosen song */}
            <div className="border-2 border-win-border-alt p-2 rounded-sm bg-white">
              <h2 className="font-semibold text-[9px] text-gray-600 uppercase mb-1">
                Song
              </h2>

              {formData.songName ? (
                <div className="flex items-center gap-2">
                  {formData.songAlbumCover ? (
                    <img
                      src={formData.songAlbumCover}
                      alt={formData.songAlbum || "Album cover"}
                      className="w-8 h-8 rounded object-cover border border-gray-300 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-400 text-[8px] shrink-0">
                      No Cover
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-xs  wrap-break-word">
                      {formData.songName}
                    </p>

                    <p className="text-[10px] text-gray-600 wrap-break-word">
                      {formData.songArtist}{" "}
                      {formData.songYear ? `(${formData.songYear})` : ""}
                    </p>

                    {formData.songAlbum && (
                      <p className="text-[10px] text-gray-600 italic wrap-break-word">
                        {formData.songAlbum}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs italic text-gray-400">No song selected</p>
              )}
            </div>

            {/* Personal message */}
            <div className="border-2 border-win-border-alt p-2 rounded-sm bg-white">
              <h2 className="font-semibold text-[9px] text-gray-600 uppercase mb-0.5">
                Message
              </h2>

              {formData.message ? (
                <p className="text-xs whitespace-pre-wrap wrap-break-word">
                  {formData.message}
                </p>
              ) : (
                <p className="text-xs italic text-gray-400">No message</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
}
