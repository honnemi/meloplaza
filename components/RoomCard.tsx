"use client";

import { useEffect, useRef, useState } from "react";

interface RoomProps {
  id: string;
  name: string;
  description: string;
  capacity: number;
  memberCount: number;
  isMember: boolean;
  isPending: boolean;
  created_by: string | null;
  tag?: "OWNER" | null;
  onJoin: () => void;
  /** Only passed for rooms the current user owns. Shows the ▾ menu. */
  onDelete?: () => void;
}

export default function RoomCard({
  name,
  description,
  capacity,
  memberCount,
  isMember,
  isPending,
  tag = null,
  onJoin,
  onDelete,
}: RoomProps) {
  const isFull = memberCount >= capacity;
  const canVisit = isMember || tag === "OWNER";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  function playClickSound() {
    const clickAudio = new Audio("/assets/click.mp3");
    clickAudio.volume = 0.2;
    clickAudio.play().catch(() => {});
  }

  // Close the dropdown on outside tap/click or Escape
  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <div
      className={`group relative min-w-0 rounded-md border-2 border-win-border-dark bg-[#d5f0f5] shadow-[3px_3px_0px_rgba(0,90,100,0.25)] transition-transform hover:-translate-y-[1px] sm:shadow-[4px_4px_0px_rgba(0,90,100,0.25)] ${
        menuOpen ? "z-30" : "z-0"
      }`}
    >
      {/* Glossy highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-md"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* Header: wraps instead of overlapping when the card gets narrow */}
      <div className="relative flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 rounded-t-[4px] border-b-2 border-[#8bbfc9] bg-gradient-to-r from-[#b8f2fa] to-[#e8fdff] px-2.5 py-2 sm:px-3">
        <div className="flex min-w-[7rem] flex-1 items-center gap-1.5 sm:gap-2">
          <span className="shrink-0 text-base leading-none text-[#4a8da0] sm:text-lg">
            ♫
          </span>
          <h2 className="min-w-0 font-heading text-sm font-bold text-[#174e65] [overflow-wrap:anywhere]">
            {name}
          </h2>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {tag && (
            <span
              className={`rounded-full border-2 px-1.5 py-0.5 text-[9px] font-bold font-heading tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,0.12)] sm:px-2 sm:py-1 ${"border-[#3f9a6a] bg-[#d6fbe4] text-[#1f6b45]"}`}
            >
              {tag}
            </span>
          )}

          {onDelete && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                aria-label="Room options"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                disabled={isPending}
                onClick={() => {
                  (setMenuOpen((open) => !open), playClickSound());
                }}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border-2 border-[#397b8b] bg-gradient-to-b from-white to-[#bceef5] text-xs font-bold leading-none text-[#245b6a] shadow-[2px_2px_0px_rgba(0,90,100,0.25)] hover:to-[#a9e3ec] active:translate-y-[1px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 sm:h-6 sm:w-6"
              >
                ▾
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-40 mt-1 w-40 overflow-hidden rounded-sm border-2 border-[#397b8b] bg-gradient-to-b from-white to-[#e6f9fc] shadow-[3px_3px_0px_rgba(0,90,100,0.3)] sm:w-36"
                >
                  <button
                    type="button"
                    role="menuitem"
                    disabled={isPending}
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="flex min-h-11 w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[11px] font-bold tracking-wider text-[#a3326f] hover:bg-[#d5f0f5] active:bg-[#d5f0f5] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0"
                  >
                    <i className="hn hn-trash-solid" />
                    Delete room
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="relative flex flex-col gap-3 p-2.5 sm:p-3">
        {/* Description + member count: the count drops below the text
            when there isn't room for both side by side */}
        <div className="flex flex-wrap items-start justify-between gap-2.5 sm:gap-3">
          <div className="min-w-[9rem] flex-1 basis-40">
            <p className="mb-1 text-[10px] font-bold font-heading uppercase tracking-[0.15em] text-[#428293]">
              Room description
            </p>
            <p className="text-[13px] leading-relaxed text-[#365c68] [overflow-wrap:anywhere] sm:text-xs">
              {description || "No description yet. Come say hi!"}
            </p>
          </div>

          <div className="shrink-0 rounded-sm border-2 border-[#82bbc7] bg-white/80 px-2 py-1 text-center shadow-[inset_1px_1px_3px_rgba(0,90,100,0.12)]">
            <p className="font-heading text-base font-bold leading-tight text-[#176678] sm:text-lg">
              {memberCount}/{capacity}
            </p>
            <p className="text-[9px] uppercase tracking-wide text-[#6797a2]">
              {memberCount === 1 ? "member" : "members"}
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-dashed border-[#91c5cf] pt-3">
          <button
            type="button"
            onClick={onJoin}
            disabled={isPending || (!canVisit && isFull)}
            className="min-h-10 w-full cursor-pointer rounded-sm border-2 border-[#397b8b] bg-gradient-to-b from-white to-[#bceef5] px-3 py-2 font-heading text-xs font-bold text-[#245b6a] shadow-[3px_3px_0px_rgba(0,90,100,0.25)] transition-all hover:-translate-y-[1px] hover:to-[#a9e3ec] active:translate-y-[1px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:w-auto"
          >
            {isPending
              ? "Please wait..."
              : canVisit
                ? "Visit Room"
                : isFull
                  ? "Room Full"
                  : "Visit Room"}
          </button>
        </div>
      </div>
    </div>
  );
}
