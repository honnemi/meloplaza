"use client";

import { Link } from "next-view-transitions";
import { useEffect, useState } from "react";
import { getCurrentUserId } from "@/app/actions";

export default function Navigation() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Play sound on click
  function playClickSound() {
    if (typeof window !== "undefined") {
      const clickAudio = new Audio("/assets/click.mp3");
      clickAudio.volume = 0.5;
      clickAudio.play().catch((err) => console.error("Audio blocked by browser:", err));
    }
  }

  useEffect(() => {
    const loadUserProfile = async () => {
      const user = await getCurrentUserId();
      setCurrentUser(user);
    };

    loadUserProfile();
  }, []);

  return (
    <div
      className="relative z-20 flex flex-row items-center justify-between
        px-8 py-4
        bg-(image:--win-titlebar)
        border-b-2 border-win-border-dark
        shadow-[0_4px_6px_rgba(0,90,100,0.3),inset_0_1px_0px_rgba(255,255,255,0.9)]"
    >
      <span className="text-xl font-bold font-heading">meloplaza</span>

      <div className="flex flex-row items-center gap-10">
        <Link
          href={`/profile/${currentUser}`}
          className="relative flex flex-row gap-2 items-center hover:cursor-pointer"
          onClick={() => playClickSound()}
        >
          <i className="text-xs hn hn-disc-solid "></i>
          <span className="text-xs font-bold font-heading">
            My Recommendation
          </span>
        </Link>

        <Link
          href="/collection"
          className="relative flex flex-row gap-2 items-center hover:cursor-pointer"
          onClick={() => playClickSound()}
        >
          <i className="text-xs hn hn-folder-solid"></i>
          <span className="text-xs font-bold font-heading">My Collection</span>
        </Link>

        <Link
          href="/"
          className="relative flex flex-row gap-2 items-center hover:cursor-pointer"
          onClick={() => playClickSound()}
        >
          <i className="text-xs hn hn-logout-solid"></i>
          <span className="text-xs font-bold font-heading">Exit</span>
        </Link>
      </div>
    </div>
  );
}
