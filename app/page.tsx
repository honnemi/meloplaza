"use client";

import Button from "@/components/Button";
import TextType from "@/components/TextType";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <main className="flex flex-col items-center justify-center w-full">
        <img src="/assets/logo.svg" />
        <TextType 
          text={["meloplaza", "(the cool way to discover music)"]}
          typingSpeed={100}
          pauseDuration={5000}
          showCursor
          cursorCharacter="♩"
          deletingSpeed={50}
          cursorBlinkDuration={0.5}
        />
        <div className="scale-125 sm:scale-150 md:scale-[2] transform origin-center mt-8 sm:mt-12">
          <Button label="Start" href="/create-avatar" />
        </div>
      </main>
    </div>
  );
}
