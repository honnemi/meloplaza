"use client";

import { useState } from "react";
import GlobalChat from "@/components/GlobalChat";

// Button to open/close global chat in rooms

export default function ChatWidget({ roomId }: { roomId: string | null }) {
  const [open, setOpen] = useState(false);

  // Play sound on click
  function playClickSound() {
    if (typeof window !== "undefined") {
      const clickAudio = new Audio("/assets/click.mp3");
      clickAudio.volume = 0.2;
      clickAudio
        .play()
        .catch((err) => console.error("Audio blocked by browser:", err));
    }
  }

  return (
    <div className="fixed right-3 bottom-36 z-50 flex flex-col items-end gap-2 sm:right-4 sm:bottom-24">
      {open && <GlobalChat roomId={roomId} onClose={() => setOpen(false)} />}

      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          playClickSound();
        }}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Open chat"}
        className="cursor-pointer p-2 sm:px-4 sm:py-3"
      >
        <i className="hn hn-message-solid text-4xl sm:text-5xl bg-linear-to-b from-[#00c3d0] to-[#ffffff] bg-clip-text text-transparent [-webkit-text-stroke:1px_var(--color-gray-600)]"></i>
      </button>
    </div>
  );
}
