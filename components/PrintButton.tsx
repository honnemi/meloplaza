"use client";

import { SecondaryButton } from "@/components/Button";

// Play success sound on add to collection
function playSuccessSound() {
  if (typeof window !== "undefined") {
    const clickAudio = new Audio("/assets/success.mp3");
    clickAudio.volume = 0.2;
    clickAudio
      .play()
      .catch((err) => console.error("Audio blocked by browser:", err));
  }
}

export default function PrintButton() {
  // Print window on button click
  return (
    <SecondaryButton
      label="Print"
      icon={<i className="hn hn-print-solid"></i>}
      onClick={() => {
        window.print();
        playSuccessSound();
      }}
    />
  );
}
