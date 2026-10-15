"use client";

import { useTransitionRouter } from "next-view-transitions";
import { useState } from "react";

const NAV_ITEMS = [
  {
    key: "profile",
    label: "Profile",
    href: "/profile",
    icon: "/assets/person.png",
    iconHover: "/assets/person.png",
  },
  {
    key: "collection",
    label: "Collection",
    href: "/collection",
    icon: "/assets/folder-closed.png",
    iconHover: "/assets/folder-open.png",
  },
  {
    key: "rooms",
    label: "Rooms",
    href: "/rooms",
    icon: "/assets/door-closed.png",
    iconHover: "/assets/door-open.png",
  },
];

export default function Navigation() {
  const router = useTransitionRouter();
  const [hovered, setHovered] = useState<string | null>(null);

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
    <div
      className="z-20 flex flex-row items-center justify-between
        px-4 sm:px-8 py-4 h-16
        w-[92%] max-w-xl sm:w-[70%] sm:max-w-none
        bg-(image:--win-titlebar)
        border-l-2 border-r-2 border-t-2 border-win-border-dark
        shadow-[0_4px_6px_rgba(0,90,100,0.3),inset_0_1px_0px_rgba(255,255,255,0.9)]
        fixed bottom-0 left-1/2 -translate-x-1/2
        rounded-tl-lg rounded-tr-lg"
    >
      {/* Icons poke up above the bar. The offset is (icon height - 32px):
          56px icons on mobile (-top-6), 80px icons from sm up (-top-12). */}
      <div className="absolute -top-6 sm:-top-12 left-0 right-0 flex flex-row justify-center gap-4 sm:gap-10 w-full z-30">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className="shrink-0 flex flex-col items-center justify-center hover:-translate-y-2 cursor-pointer transition-transform"
            onMouseEnter={() => setHovered(item.key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => {
              playClickSound();
              router.push(item.href);
            }}
          >
            <img
              className="w-14 h-14 sm:w-20 sm:h-20 max-w-none shrink-0 object-contain"
              src={hovered === item.key ? item.iconHover : item.icon}
              alt={item.label}
            />
            <p className="font-heading text-sm sm:text-lg font-bold -mt-3 sm:-mt-4 whitespace-nowrap">
              {item.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}