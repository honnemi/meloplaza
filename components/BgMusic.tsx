"use client";

import { useEffect, useRef, useState } from "react";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Load the audio file
    audioRef.current = new Audio("/assets/bg-music.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.1;

    // Play audio on first user interaction (click, keydown, or touchstart)
    const handleFirstInteraction = async () => {
      if (!audioRef.current) return;

      try {
        // Ensures it always starts from the absolute beginning
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setIsPlaying(true);

        // Remove listeners once playback has successfully started
        cleanupListeners();
      } catch (err) {
        console.log("Autoplay prevented, waiting for next interaction", err);
      }
    };

    const cleanupListeners = () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };

    // Attach listeners to common user interactions
    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);

    // Clean up audio and listeners if component unmounts
    return () => {
      cleanupListeners();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Toggle music on button click
  const toggleMusic = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.log("Playback failed:", err);
    }
  };

  return (
    <button
      onClick={toggleMusic}
      aria-label={isPlaying ? "Mute music" : "Play music"}
      className="cursor-pointer p-2 sm:px-4 sm:py-3"
    >
      <i
        className={`hn ${
          isPlaying ? "hn-sound-on-solid" : "hn-sound-mute-solid"
        } text-4xl sm:text-5xl bg-linear-to-b from-[#00c3d0] to-[#ffffff] bg-clip-text text-transparent [-webkit-text-stroke:1px_var(--color-gray-600)]`}
      />
    </button>
  );
}
