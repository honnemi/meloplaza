"use client";

import { useState, FormEvent } from "react";
import Button, { SecondaryButton } from "@/components/Button";
import TextType from "@/components/TextType";
import Popup from "@/components/PopupWindow";
import { createClient } from "@/lib/supabase/client";
import { useTransitionRouter } from "next-view-transitions";
import Link from "next/link";

export default function Home() {
  const router = useTransitionRouter();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupMessage, setSignupMessage] = useState<string | null>(null);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Play sound on click
  function playClickSound() {
    if (typeof window !== "undefined") {
      const clickAudio = new Audio("/assets/click.mp3");
      clickAudio.volume = 0.2;
      clickAudio.play().catch(() => {});
    }
  }

  // Shared modal button styling
  const actionButtonClass =
    "flex flex-row items-center justify-center gap-2 rounded-sm border-2 border-win-border-dark bg-win-alt px-4 py-3 font-heading text-sm font-bold text-gray-800 shadow-[3px_3px_0px_rgba(0,90,100,0.3)] transition-transform hover:-translate-y-[1px] hover:cursor-pointer active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50";

  const actionButtonStyle = {
    backgroundImage: "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
  };

  // Open signup modal
  function openSignupModal() {
    setEmail("");
    setPassword("");
    setSignupError(null);
    setSignupMessage(null);
    setIsSignupModalOpen(true);
    playClickSound();
  }

  // Open login modal
  function openLoginModal() {
    setEmail("");
    setPassword("");
    setLoginError(null);
    setIsLoginModalOpen(true);
    playClickSound();
  }

  // Handle signup submission
  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    setSignupError(null);
    setSignupMessage(null);

    const trimmedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setSignupError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setSignupError("Password must be at least 6 characters long.");
      return;
    }

    setIsSigningUp(true);
    playClickSound();

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      });

      if (error) {
        setSignupError(error.message);
        return;
      }

      // Check whether Supabase established an authenticated session.
      if (!data.session) {
        setSignupMessage(
          "Account created! Please check your email to confirm your account before logging in."
        );
        return;
      }

      // Account created and authenticated.
      setIsSignupModalOpen(false);
      setEmail("");
      setPassword("");

      router.push("/create-avatar");
      router.refresh();

    } catch (error) {
      console.error("Signup failed:", error);
      setSignupError("Something went wrong. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  };

  // Handle login submission
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedEmail = email.trim().toLowerCase();

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

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        setLoginError(error.message);
        return;
      }

      setIsLoginModalOpen(false);
      router.push("/plaza");
      router.refresh();

    } catch (error) {
      console.error("Login failed:", error);
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Close signup modal
  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
    setSignupError(null);
    setSignupMessage(null);
    setEmail("");
    setPassword("");
    playClickSound();
  };

  // Close login modal
  const closeLoginModal = () => {
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

        {/* Animated text typing effect */}
        <TextType
          text={["meloplaza"]}
          typingSpeed={100}
          pauseDuration={5000}
          showCursor
          cursorCharacter="♩"
          deletingSpeed={50}
          cursorBlinkDuration={0.5}
        />
        <div className="flex flex-col items-center mt-8 sm:mt-12 gap-5">

          {/* Main buttons */}
          <div className="flex flex-row items-center justify-center gap-2 scale-125 sm:scale-150 md:scale-[2] transform origin-center">


            {/* Sign up button */}
            <Button
              label="Sign up"
              onClick={openSignupModal}
            >
            </Button>

            {/* Login button */}
            <div onClick={openLoginModal}>
              <SecondaryButton label="Login" />
            </div>

          </div>

          {/* Continue as guest */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              router.push("/create-avatar");
            }}
            className="text-xs sm:text-sm md:text-base text-gray-600 hover:underline cursor-pointer mt-2 md:mt-6"
          >
            Continue without an account
          </button>

        </div>

      </main>

      {/* Signup modal */}
      <Popup
        title="Create Account"
        isOpen={isSignupModalOpen}
        onClose={closeSignupModal}
      >
        <form onSubmit={handleSignup} className="flex flex-col gap-4">

          <p className="text-sm text-gray-600">
            Create an account to permanently save your Melo and access it anywhere.
          </p>

          {signupError && (
            <div className="rounded border border-red-400 bg-red-100 p-2.5 text-xs font-medium text-red-700">
              {signupError}
            </div>
          )}

          {signupMessage && (
            <div className="rounded border border-green-400 bg-green-100 p-2.5 text-xs font-medium text-green-800">
              {signupMessage}
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
              placeholder="Enter email"
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-heading text-sm font-semibold text-gray-600">
              PASSWORD{" "}
              <span className="text-xs text-gray-400">
                (min. 6 characters)
              </span>
            </label>

            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-input"
              placeholder="Enter password"
              autoComplete="new-password"
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="submit"
              disabled={isSigningUp}
              className={actionButtonClass}
              style={actionButtonStyle}
            >
              {isSigningUp ? "Creating account..." : "Create Account"}
            </button>
          </div>

        </form>
      </Popup>

      {/* Login modal */}
      <Popup
        title="Account Login"
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
      >
        <form onSubmit={handleLogin} className="flex flex-col gap-4">

          <p className="text-sm text-gray-600">
            Enter your credentials to access your saved melo.
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
              placeholder="Enter email"
              autoComplete="email"
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
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="submit"
              disabled={isLoggingIn}
              className={actionButtonClass}
              style={actionButtonStyle}
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>
          </div>

        </form>
      </Popup>

    </div>
  );
}
