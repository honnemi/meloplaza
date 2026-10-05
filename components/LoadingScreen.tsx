"use client";

import { useEffect, useState } from "react";
import Window from "./Window";

const SEGMENTS = 20;

export default function LoadingScreen({ title = "Loading" }: { title?: string }) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState(0);

  // Fake progress animation
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : Math.min(100, p + 2 + Math.random() * 8)));
    }, 150);
    return () => clearInterval(id);
  }, []);

  // Animated ellipsis
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(id);
  }, []);

  const filled = Math.floor((progress / 100) * SEGMENTS);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Window
        title={title}
        className="md:w-[28rem] h-auto"
        contentClassName="flex flex-col items-center justify-center gap-5 py-10"
      >
        <p className="text-lg font-bold select-none">
          Please wait a moment
          <span className="inline-block w-6 text-left">{".".repeat(dots)}</span>
        </p>

        {/* Progress bar */}
        <div
          role="progressbar"
          aria-busy="true"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          className="flex h-7 w-full max-w-xs gap-0.5 rounded-sm border-2 border-win-border-dark bg-white p-0.5
            shadow-[inset_1px_1px_0px_rgba(0,90,100,0.25),inset_-1px_-1px_0px_rgba(255,255,255,0.9)]"
        >
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <div
              key={i}
              className={`h-full flex-1 rounded-[1px] transition-colors duration-100 ${
                i < filled
                  ? "bg-linear-to-b from-[#9ceaf2] via-[#3dbdcc] to-[#1a9fb0] shadow-[inset_0_1px_0px_rgba(255,255,255,0.7)]"
                  : "bg-transparent"
              }`}
            />
          ))}
        </div>
      </Window>
    </div>
  );
}