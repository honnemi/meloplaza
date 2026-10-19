"use client";

import { SecondaryButton } from "@/components/Button";

// Play success sound on print
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
  return (
    <SecondaryButton
      label="Print"
      icon={<i className="hn hn-print-solid"></i>}
      onClick={() => {
        // Trigger print dialog for browser page
        window.print();
        playSuccessSound();
      }}
    />
  );
}
