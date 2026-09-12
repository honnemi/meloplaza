"use client";

import SplitText from "@/components/SplitText";
import Button from "@/components/Button";

const handleAnimationComplete = () => {
  console.log("All letters have animated!");
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <main className="flex flex-col items-center justify-center w-full">
        <SplitText
          text="meloplaza"
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold text-center"
          delay={50}
          duration={1.25}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
          onLetterAnimationComplete={handleAnimationComplete}
        />
        <div className="scale-125 sm:scale-150 md:scale-[2] transform origin-center mt-8 sm:mt-12">
          <Button label="Start" href="/create-avatar" />
        </div>
      </main>
    </div>
  );
}