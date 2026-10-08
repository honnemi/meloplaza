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
    // Toggle button for background music
    <button
      onClick={toggleMusic}
      style={{
        fontSize: "36px",
        padding: "10px 15px",
        cursor: "pointer",
      }}
    >
      {isPlaying ? (
        <i className="hn hn-sound-on-solid text-6xl bg-linear-to-b from-[#00c3d0] to-[#ffffff] bg-clip-text text-transparent [-webkit-text-stroke:1px_var(--color-gray-600)]" />
      ) : (
        <i className="hn hn-sound-mute-solid text-6xl bg-linear-to-b from-[#00c3d0] to-[#ffffff] bg-clip-text text-transparent [-webkit-text-stroke:1px_var(--color-gray-600)]" />
      )}
    </button>
  );
}
