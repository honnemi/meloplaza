
"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUserId,
  getUserById,
  getUserRecommendationById,
  getRecommendationCollectionCount,
  upgradeAnonymousAccount,
} from "@/app/actions";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";
import Window from "@/components/Window";
import Button from "@/components/Button";
import LoadingScreen from "@/components/LoadingScreen";
import Popup from "@/components/PopupWindow";
import { useTransitionRouter } from "next-view-transitions";
import { useFormStore } from "@/app/context/FormContext";
import { useSearchParams } from "next/navigation";

interface UserProfileData {
  displayName: string;
  colour: string;
  faceIndex: number;
  prompt?: string;
  songName?: string;
  songArtist?: string;
  songAlbum?: string;
  songYear?: string;
  songAlbumCover?: string;
  songId?: string;
  songDuration?: number;
  message?: string;
  collectionCount: number;
}

export default function ProfilePageClient() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [savingMessage, setSavingMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const searchParams = useSearchParams();
  const fromRoom = searchParams.get("fromRoom");

  const profileHref = "/profile";

  const backHref = fromRoom
    ? `/room/${encodeURIComponent(fromRoom)}`
    : "/plaza";

  const { updateForm } = useFormStore();
  const router = useTransitionRouter();

  useEffect(() => {
    async function loadProfileData() {
      try {
        const supabase = createClient();

        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Failed to load auth user:", authError);
        }

        setIsAnonymous(authUser?.is_anonymous ?? true);
        setEmail(authUser?.email ?? "");

        const userId = await getCurrentUserId();

        if (!userId) {
          setLoading(false);
          return;
        }

        const [user, recommendation] = await Promise.all([
          getUserById(userId),
          getUserRecommendationById(userId),
        ]);

        let collectionCount = 0;

        if (recommendation?.id) {
          collectionCount = await getRecommendationCollectionCount(
            recommendation.id,
          );
        }

        if (user) {
          setProfile({
            displayName: user.display_name,
            colour: user.colour,
            faceIndex: user.face_index,
            prompt: recommendation?.prompt,
            songName: recommendation?.song_name,
            songArtist: recommendation?.song_artist,
            songAlbum: recommendation?.song_album,
            songYear: recommendation?.song_year,
            songAlbumCover: recommendation?.song_album_cover,
            songId: recommendation?.song_id,
            songDuration: recommendation?.song_duration,
            message: recommendation?.message,
            collectionCount,
          });
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, []);

  function playClickSound() {
    if (typeof window !== "undefined") {
      const clickAudio = new Audio("/assets/click.mp3");
      clickAudio.volume = 0.2;
      clickAudio.play().catch(() => {});
    }
  }

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingError(null);
    setSavingMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setSavingError("Please enter a valid email address.");
      return;
    }

    if (password.length > 0 && password.length < 6) {
      setSavingError("Password must be at least 6 characters long.");
      return;
    }

    if (isAnonymous && password.length < 6) {
      setSavingError("Password must be at least 6 characters long.");
      return;
    }

    setIsSaving(true);
    playClickSound();

    try {
      if (isAnonymous) {
        const res = await upgradeAnonymousAccount(trimmedEmail, password);

        if (res.error) {
          setSavingError(res.error);
          return;
        }

        setIsAnonymous(false);
        setPassword("");
        setIsSaveModalOpen(false);
        alert("Account successfully saved! You can now log in with your email.");
        return;
      }

      const supabase = createClient();
      const {
        data: { user: currentUser },
        error: getUserError,
      } = await supabase.auth.getUser();

      if (getUserError || !currentUser) {
        setSavingError("Unable to verify your account. Please try again.");
        return;
      }

      const emailChanged = trimmedEmail !== (currentUser.email ?? "");
      const passwordChanged = password.length > 0;

      if (!emailChanged && !passwordChanged) {
        setSavingError("Please enter a new email or password to update.");
        return;
      }

      const updates: { email?: string; password?: string } = {};

      if (emailChanged) {
        updates.email = trimmedEmail;
      }

      if (passwordChanged) {
        updates.password = password;
      }

      const { error } = await supabase.auth.updateUser(updates);

      if (error) {
        setSavingError(error.message);
        return;
      }

      setPassword("");
      setIsSaveModalOpen(false);

      if (emailChanged) {
        alert(
          "Account updated. Check your email if confirmation is required to complete your email change.",
        );
      } else {
        alert("Password updated successfully.");
      }
    } catch (error) {
      console.error("Failed to update account:", error);
      setSavingError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const closeSaveModal = () => {
    setIsSaveModalOpen(false);
    setSavingError(null);
    setSavingMessage(null);
    setPassword("");
    playClickSound();
  };

  const openAccountModal = () => {
    setSavingError(null);
    setSavingMessage(null);
    setPassword("");
    setIsSaveModalOpen(true);
    playClickSound();
  };

  const handleEditMelo = () => {
    if (!profile) return;

    updateForm({
      displayName: profile.displayName,
      colour: profile.colour,
      faceIndex: profile.faceIndex,
      editMode: "melo",
      isEditing: true,
      returnTo: fromRoom
        ? `${profileHref}?fromRoom=${encodeURIComponent(fromRoom)}`
        : profileHref,
    });

    playClickSound();
    router.push("/create-avatar");
  };

  const handleEditRecommendation = () => {
    if (!profile) return;

    updateForm({
      displayName: profile.displayName,
      colour: profile.colour,
      faceIndex: profile.faceIndex,
      prompt: profile.prompt || "",
      songName: profile.songName || "",
      songArtist: profile.songArtist || "",
      songAlbum: profile.songAlbum || "",
      songYear: profile.songYear || "",
      songAlbumCover: profile.songAlbumCover || "",
      songId: profile.songId || "",
      songDuration: profile.songDuration || 0,
      message: profile.message || "",
      editMode: "recommendation",
      isEditing: true,
      returnTo: fromRoom
        ? `${profileHref}?fromRoom=${encodeURIComponent(fromRoom)}`
        : profileHref,
    });

    playClickSound();
    router.push("/select-prompt");
  };

  const actionButtonClass =
    "w-full lg:w-auto lg:flex-1 lg:basis-[11rem] min-w-0 px-4 py-3 text-sm font-bold border-2 border-win-border-dark rounded-sm bg-win-alt shadow-[3px_3px_0px_rgba(0,90,100,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] cursor-pointer text-gray-800 font-heading flex flex-row items-center justify-center gap-2.5 whitespace-nowrap transition-transform disabled:opacity-50 disabled:cursor-not-allowed";

  const actionButtonStyle = {
    backgroundImage: "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 sm:p-12">
        <LoadingScreen />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 sm:p-12">
        <Window
          title="My Profile"
          contentClassName="p-5 sm:p-8"
          icon={<i className="hn hn-user-solid text-xl" />}
          footer={
            <div className="flex w-full justify-between">
              <Button label="Back" href={backHref} />
            </div>
          }
        >
          <div className="flex items-center justify-center py-10 text-center text-base font-bold text-gray-500 sm:py-16">
            No profile found. Please log in or create a Melo.
          </div>
        </Window>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 sm:p-12">
      <Window
        title="My Profile"
        contentClassName="p-4 sm:p-5 md:p-6"
        icon={<i className="hn hn-user-solid text-xl" />}
        footer={
          <div className="flex w-full justify-between">
            <Button label="Back" href={backHref} />
          </div>
        }
      >
        <div className="flex w-full flex-col items-center gap-4 lg:flex-row lg:items-start lg:gap-6">
          <div className="flex h-36 w-36 shrink-0 flex-col items-center justify-center gap-3 rounded-sm border-2 border-win-border-alt bg-white p-3 shadow-xs sm:h-40 sm:w-40">
            <span className="max-w-28 wrap-break-word text-center text-xs font-bold text-gray-800">
              {profile.displayName || "Anonymous"}
            </span>

            <Avatar
              colour={profile.colour}
              faceIndex={profile.faceIndex}
              size="size-16 sm:size-20"
              textSize="text-xl sm:text-2xl"
            />
          </div>

          {profile.prompt || profile.songName || profile.message ? (
            <div className="flex w-full min-w-0 flex-1 flex-col justify-between">
              <div className="space-y-3">
                {profile.prompt && (
                  <div className="rounded-sm border-2 border-win-border-alt bg-white p-3">
                    <h2 className="mb-1 text-xs font-semibold uppercase text-gray-600">
                      Prompt
                    </h2>
                    <p className="wrap-break-word text-sm italic text-gray-800">
                      &quot;{profile.prompt}&quot;
                    </p>
                  </div>
                )}

                {profile.songName && (
                  <div className="rounded-sm border-2 border-win-border-alt bg-white p-3">
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                      <h2 className="text-xs font-semibold uppercase text-gray-600">
                        Song
                      </h2>

                      <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-win-border bg-win-alt/40 px-2 py-0.5 font-heading text-xs text-gray-600">
                        <i className="hn hn-heart-solid text-[10px] text-pink-500" />
                        <span className="font-bold">
                          Added by {profile.collectionCount}{" "}
                          {profile.collectionCount === 1 ? "person" : "people"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {profile.songAlbumCover && (
                        <img
                          src={profile.songAlbumCover}
                          alt={profile.songAlbum || "Album cover"}
                          className="h-12 w-12 shrink-0 rounded object-cover"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="wrap-break-word text-sm font-semibold text-gray-900">
                          {profile.songName}
                        </p>
                        <p className="wrap-break-word text-xs text-gray-600">
                          {profile.songArtist}{" "}
                          {profile.songYear ? `(${profile.songYear})` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {profile.message && (
                  <div className="rounded-sm border-2 border-win-border-alt bg-white p-3">
                    <h2 className="mb-1 text-xs font-semibold uppercase text-gray-600">
                      Message
                    </h2>
                    <p className="whitespace-pre-wrap wrap-break-word text-sm text-gray-800">
                      {profile.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:mt-6 lg:flex-row lg:flex-wrap">
                <button
                  type="button"
                  onClick={handleEditMelo}
                  className={actionButtonClass}
                  style={actionButtonStyle}
                >
                  <i className="hn hn-pencil-solid text-base" />
                  Edit Melo
                </button>

                <button
                  type="button"
                  onClick={handleEditRecommendation}
                  className={actionButtonClass}
                  style={actionButtonStyle}
                >
                  <i className="hn hn-music-solid text-base" />
                  Edit Recommendation
                </button>

                <button
                  type="button"
                  onClick={openAccountModal}
                  className={actionButtonClass}
                  style={actionButtonStyle}
                >
                  <i
                    className={`hn ${
                      isAnonymous ? "hn-save-solid" : "hn-pencil-solid"
                    } text-base`}
                  />
                  {isAnonymous ? "Save Account" : "Edit Account"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[160px] w-full min-w-0 flex-1 flex-col items-center justify-center">
              <div className="text-center text-sm text-gray-400">
                No Melo details found for this profile yet.
              </div>

              <div className="mt-6 flex w-full flex-col gap-3 lg:flex-row lg:flex-wrap">
                <button
                  type="button"
                  onClick={handleEditMelo}
                  className={actionButtonClass}
                  style={actionButtonStyle}
                >
                  <i className="hn hn-pencil-solid text-base" />
                  Edit Melo
                </button>

                <button
                  type="button"
                  onClick={handleEditRecommendation}
                  className={actionButtonClass}
                  style={actionButtonStyle}
                >
                  <i className="hn hn-music-solid text-base" />
                  Edit Recommendation
                </button>

                <button
                  type="button"
                  onClick={openAccountModal}
                  className={actionButtonClass}
                  style={actionButtonStyle}
                >
                  <i
                    className={`hn ${
                      isAnonymous ? "hn-save-solid" : "hn-pencil-solid"
                    } text-base`}
                  />
                  {isAnonymous ? "Save Account" : "Edit Account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Window>

      <Popup
        title={isAnonymous ? "Save Account" : "Edit Account"}
        isOpen={isSaveModalOpen}
        onClose={closeSaveModal}
      >
        <form onSubmit={handleSaveAccount} className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            {isAnonymous
              ? "Link an email and password to permanently save your account and access it anywhere."
              : "Update your account email or password. Leave the password blank if you don't want to change it."}
          </p>

          {savingError && (
            <div className="rounded border border-red-400 bg-red-100 p-2.5 text-xs font-medium text-red-700">
              {savingError}
            </div>
          )}

          {savingMessage && (
            <div className="rounded border border-green-400 bg-green-100 p-2.5 text-xs font-medium text-green-800">
              {savingMessage}
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
              {!isAnonymous && (
                <span className="text-xs text-gray-400">(optional)</span>
              )}
              {isAnonymous && (
                <span className="text-xs text-gray-400">
                  (min. 6 characters)
                </span>
              )}
            </label>
            <input
              type="password"
              required={isAnonymous}
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
              disabled={isSaving}
              className="flex flex-row items-center justify-center gap-2 rounded-sm border-2 border-win-border-dark bg-win-alt px-4 py-3 font-heading text-sm font-bold text-gray-800 shadow-[3px_3px_0px_rgba(0,90,100,0.3)] transition-transform hover:-translate-y-[1px] hover:cursor-pointer active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50"
              style={actionButtonStyle}
            >
              {isSaving
                ? "Saving..."
                : isAnonymous
                  ? "Save Account"
                  : "Update Account"}
            </button>
          </div>
        </form>
      </Popup>
    </div>
  );
}
