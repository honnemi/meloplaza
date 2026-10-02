'use client'; 

import { useEffect, useRef, useState } from 'react';

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Initialize the audio
    audioRef.current = new Audio('/assets/bg-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.1;

    // Define what happens on the user's first interaction
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
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    // Attach listeners to common user interactions
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    // Clean up audio and listeners if component unmounts
    return () => {
      cleanupListeners();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
      style={{
        fontSize: '36px',
        padding: '10px 15px',
        cursor: 'pointer'
      }}
    >
      {isPlaying ? '🔊' : '🔇'}
    </button>
  );
}