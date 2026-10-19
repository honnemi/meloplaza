"use client";

import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  // On /room/<id> this is the room's id; anywhere else (e.g. /plaza) it's null
  const roomMatch = pathname.match(/^\/room\/([^/?#]+)/);
  const roomId = roomMatch ? decodeURIComponent(roomMatch[1]) : null;

  // Adds ?fromRoom=<id> when you're inside a room so Back returns to it
  function hrefFor(base: string) {
    return roomId ? `${base}?fromRoom=${encodeURIComponent(roomId)}` : base;
  }

  // Play sound on click
  function playClickSound() {
    if (typeof window !== "undefined") {
      const clickAudio = new Audio("/assets/click.mp3");
      clickAudio.volume = 0.2;
      clickAudio.play();
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
      {/* Navigation buttons */}
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
              const target = hrefFor(item.href);
              router.push(hrefFor(item.href));
            }}
          >
            {/* Icon */}
            <img
              className="w-14 h-14 sm:w-20 sm:h-20 max-w-none shrink-0 object-contain"
              src={hovered === item.key ? item.iconHover : item.icon}
              alt={item.label}
            />
            {/* Label */}
            <p className="font-heading text-sm sm:text-lg font-bold -mt-3 sm:-mt-4 whitespace-nowrap">
              {item.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
