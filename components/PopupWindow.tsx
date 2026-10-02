"use client";

import { useEffect } from "react";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Popup({
  isOpen,
  onClose,
  title,
  children,
}: PopupProps) {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        p-4
        overflow-hidden
      "
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-[1px] bg-[rgba(0,90,100,0.08)]"
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className="
          relative
          z-10
          flex
          flex-col
          w-75
          h-100
          max-h-[calc(100dvh-2rem)]
          overflow-hidden
          rounded-md
          border-2
          border-win-border-dark
          shadow-[4px_4px_0px_rgba(0,90,100,0.3)]
          animate-popup-in
        "
      >
        {/* Top bar */}
        <div
          className="
            relative
            flex
            items-center
            justify-center
            shrink-0
            bg-(image:--win-titlebar)
            border-b-2
            border-win-border-dark
            p-3
            text-lg
            font-bold
            text-black
            select-none
            shadow-[inset_0_1px_0px_rgba(255,255,255,0.9)]
          "
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close popup"
            className="
              absolute
              right-2
              top-1/2
              -translate-y-1/2
              w-5
              h-5
              rounded-full
              border-2
              border-[#D91E45]
              transition-[filter,transform,box-shadow]
              duration-100
              shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(180,0,40,0.4),0_2px_2px_rgba(0,0,0,0.25)]
              hover:-translate-y-[calc(50%+1px)]
              hover:brightness-110
              active:translate-y-[calc(-50%+1px)]
              active:brightness-95
              cursor-pointer
            "
            style={{
              backgroundImage: `
                linear-gradient(
                  to bottom,
                  rgba(255,255,255,0.85) 0%,
                  rgba(255,255,255,0.3) 25%,
                  transparent 45%
                ),
                linear-gradient(
                  to bottom,
                  #FF2D55 0%,
                  #FF6B88 45%,
                  #FFD1DA 100%
                )
              `,
            }}
          >
          </button>

          {/* Title */}
          <span className="font-heading leading-none">{title}</span>
        </div>

        {/* Main content */}
        <div
          className="
            flex-1
            bg-win
            p-2
            min-h-0
            relative
            overflow-hidden
            shadow-[inset_0_1px_0px_rgba(255,255,255,0.7)]
          "
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent 0px, transparent 3px, rgba(255,255,255,0.35) 3px, rgba(255,255,255,0.35) 5px)",
          }}
        >
          <div
            className="
              h-full
              bg-white/60
              p-6
              rounded-sm
              border-2
              border-win-border
              overflow-y-auto
              relative
              z-10
              scroll-smooth
              shadow-[inset_1px_1px_0px_rgba(0,90,100,0.25),inset_-1px_-1px_0px_rgba(255,255,255,0.9)]
            "
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
