"use client";

import { Link } from "next-view-transitions";

export default function Navigation() {

  // Play sound on click
  function playClickSound() {
    if (typeof window !== "undefined") {
      const clickAudio = new Audio("/assets/click.mp3");
      clickAudio.volume = 0.2;
      clickAudio.play().catch((err) => console.error("Audio blocked by browser:", err));
    }
  }

  return (
    <div
      className="relative z-20 flex flex-row items-center justify-between
        px-8 py-4
        bg-(image:--win-titlebar)
        border-b-2 border-win-border-dark
        shadow-[0_4px_6px_rgba(0,90,100,0.3),inset_0_1px_0px_rgba(255,255,255,0.9)]"
    >
      <span className="text-xl font-bold font-heading">meloplaza</span>

        <Link
          href="/"
          className="relative flex flex-row gap-2 items-center hover:cursor-pointer"
          onClick={() => playClickSound()}
        >
          <i className="text-lg hn hn-logout-solid"></i>
          <span className="text-lg font-bold font-heading">Exit</span>
        </Link>
      </div>
  );
}
