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
        className="absolute inset-0 backdrop-blur-[1px]"
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
          border-gray-500
          shadow-[4px_4px_0px_rgba(0,0,0,0.3)]
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
            bg-gray-300
            border-b-2
            border-gray-500
            p-3
            text-lg
            font-bold
            text-black
            select-none
            shadow-[inset_0_1px_0px_rgba(255,255,255,0.9)]
          "
          style={{
            backgroundImage: `
              linear-gradient(
                180deg,
                #dce0e4 0%,
                #d1d5db 35%,
                #c9cdd2 50%,
                #d1d5db 65%,
                #c5c9ce 100%
              )
            `,
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close popup"
            className="
              absolute
              left-2
              top-1/2
              -translate-y-1/2
              w-5
              h-5
              rounded-full
              border-2
              border-red-700
              transition-[filter,transform,box-shadow]
              duration-100
              shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(120,0,0,0.4),0_2px_2px_rgba(0,0,0,0.25)]
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
                  #ef4444 0%,
                  #fca5a5 45%,
                  #ffffff 100%
                )
              `,
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-red-900" />
          </button>

          {/* Title */}
          <span>{title}</span>
        </div>

        {/* Main content */}
        <div
          className="
            flex-1
            bg-gray-200
            p-2
            min-h-0
            relative
            overflow-hidden
            shadow-[inset_0_1px_0px_rgba(255,255,255,0.7)]
          "
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent 0px, transparent 3px, rgba(255,255,255,0.12) 3px, rgba(255,255,255,0.12) 5px)",
          }}
        >
          <div
            className="
              h-full
              bg-gray-50
              p-6
              text-black
              rounded-sm
              border-2
              border-gray-300
              overflow-y-auto
              relative
              z-10
              scroll-smooth
              shadow-[inset_1px_1px_0px_rgba(0,0,0,0.18),inset_-1px_-1px_0px_rgba(255,255,255,0.9)]
            "
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
