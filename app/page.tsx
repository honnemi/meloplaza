"use client";

import { useState } from "react";
import Button, { SecondaryButton } from "@/components/Button";
import TextType from "@/components/TextType";
import Popup from "@/components/PopupWindow";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Play sound on click
  function playClickSound() {
    if (typeof window !== "undefined") {
      const clickAudio = new Audio("/assets/click.mp3");
      clickAudio.volume = 0.2;
      clickAudio
        .play()
        .catch((err) => console.error("Audio blocked by browser:", err));
    }
  }

  // Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedEmail = email.trim().toLowerCase();

    // Client-side validation checks
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setLoginError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setLoginError("Please enter your password.");
      return;
    }

    setIsLoggingIn(true);
    playClickSound();

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    setIsLoggingIn(false);

    if (error) {
      setLoginError(error.message);
    } else {
      setIsLoginModalOpen(false);
      router.push("/plaza");
      router.refresh();
    }
  };

  const closeModal = () => {
    setIsLoginModalOpen(false);
    setLoginError(null);
    setEmail("");
    setPassword("");
    playClickSound();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <main className="flex flex-col items-center justify-center w-full">
        <img src="/assets/logo.svg" alt="Meloplaza Logo" />
        {/* Animated text typing effect for Meloplaza*/}
        <TextType
          text={["meloplaza"]}
          typingSpeed={100}
          pauseDuration={5000}
          showCursor
          cursorCharacter="♩"
          deletingSpeed={50}
          cursorBlinkDuration={0.5}
        />
        <div className="flex flex-row gap-2 scale-125 sm:scale-150 md:scale-[2] transform origin-center mt-8 sm:mt-12">
          {/* Start button */}
          <Button label="Get Started" href="/create-avatar" />

          {/* Custom Button for Login modal trigger */}
          <div
            onClick={() => {
              setIsLoginModalOpen(true);
              playClickSound();
            }}
          >
            <SecondaryButton label="Login" />
          </div>
        </div>
      </main>

      {/* Login Modal Popup */}
      <Popup
        title="Account Login"
        isOpen={isLoginModalOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Enter your credentials to access your saved Meloplaza account.
          </p>

          {loginError && (
            <div className="p-2.5 bg-red-100 border border-red-400 text-red-700 text-xs rounded font-medium">
              {loginError}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="font-heading text-sm font-semibold text-gray-600">
              EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-input"
              placeholder="melo@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-heading text-sm font-semibold text-gray-600">
              PASSWORD
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-input"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="submit"
              disabled={isLoggingIn}
              className="px-4 py-3 text-sm font-bold border-2 border-win-border-dark rounded-sm bg-win-alt shadow-[3px_3px_0px_rgba(0,90,100,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] cursor-pointer text-gray-800 font-heading flex flex-row items-center justify-center gap-2 transition-transform disabled:opacity-50"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
              }}
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </Popup>
    </div>
  );
}
