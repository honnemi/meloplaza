"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUserId,
  getUserById,
  getUserRecommendationById,
  getRecommendationCollectionCount,
  upgradeAnonymousAccount,
} from "@/app/actions";
import Avatar from "@/components/Avatar";
import Window from "@/components/Window";
import Button from "@/components/Button";
import LoadingScreen from "@/components/LoadingScreen";
import Popup from "@/components/PopupWindow";
import { useTransitionRouter } from "next-view-transitions";
import { useFormStore } from "@/app/context/FormContext";
import { useParams, useSearchParams } from "next/navigation";

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

const PAGE_WRAPPER_CLASS =
  "w-full min-h-screen flex items-center justify-center p-6 sm:p-12";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [savingError, setSavingError] = useState<string | null>(null);
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
      clickAudio
        .play()
        .catch((err) => console.error("Audio blocked by browser:", err));
    }
  }

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setSavingError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setSavingError("Password must be at least 6 characters long.");
      return;
    }

    setIsSaving(true);
    playClickSound();

    const res = await upgradeAnonymousAccount(trimmedEmail, password);

    setIsSaving(false);

    if (res.error) {
      setSavingError(res.error);
    } else {
      setIsSaveModalOpen(false);
      setEmail("");
      setPassword("");
      alert("Account successfully saved! You can now log in with your email.");
    }
  };

  const closeSaveModal = () => {
    setIsSaveModalOpen(false);
    setSavingError(null);
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

  // Buttons wrap onto new rows instead of squishing: each wants at least ~9rem.
  const actionButtonClass =
    "w-full lg:w-auto lg:flex-1 lg:basis-[11rem] min-w-0 px-4 py-3 text-sm font-bold border-2 border-win-border-dark rounded-sm bg-win-alt shadow-[3px_3px_0px_rgba(0,90,100,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] cursor-pointer text-gray-800 font-heading flex flex-row items-center justify-center gap-2.5 whitespace-nowrap transition-transform";

  const actionButtonStyle = {
    backgroundImage: "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
  };

  if (loading) {
    return (
      <div className={PAGE_WRAPPER_CLASS}>
        <LoadingScreen />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={PAGE_WRAPPER_CLASS}>
        <Window
          title="User Profile"
          contentClassName="p-5 sm:p-8"
          icon={<i className="hn hn-user-solid text-xl"></i>}
          footer={
            <div className="flex justify-between w-full">
              <Button label="Back" href={backHref} />
            </div>
          }
        >
          <div className="flex items-center justify-center py-10 sm:py-16 text-center text-gray-500 font-bold text-base">
            No profile found. Please log in or create a Melo.
          </div>
        </Window>
      </div>
    );
  }

  return (
    <div className={PAGE_WRAPPER_CLASS}>
      <Window
        title="User Profile"
        contentClassName="p-4 sm:p-5 md:p-6"
        icon={<i className="hn hn-user-solid text-xl"></i>}
        footer={
          <div className="flex justify-between w-full">
            <Button label="Back" href={backHref} />
          </div>
        }
      >
        <div className="flex flex-col items-center lg:flex-row lg:items-start gap-4 lg:gap-6 w-full">
          <div className="bg-white w-36 h-36 sm:w-40 sm:h-40 shrink-0 flex flex-col items-center justify-center border-2 border-win-border-alt rounded-sm p-3 gap-3 shadow-xs">
            <span className="text-xs font-bold text-center max-w-28 wrap-break-word text-gray-800">
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
            <div className="w-full min-w-0 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                {profile.prompt && (
                  <div className="border-2 border-win-border-alt p-3 rounded-sm bg-white">
                    <h2 className="font-semibold text-xs text-gray-600 uppercase mb-1">
                      Prompt
                    </h2>
                    <p className="text-sm italic wrap-break-word text-gray-800">
                      "{profile.prompt}"
                    </p>
                  </div>
                )}

                {profile.songName && (
                  <div className="border-2 border-win-border-alt p-3 rounded-sm bg-white">
                    <div className="flex flex-wrap items-center justify-between mb-1.5 gap-x-2 gap-y-1">
                      <h2 className="font-semibold text-xs text-gray-600 uppercase">
                        Song
                      </h2>

                      <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-win-alt/40 border border-win-border px-2 py-0.5 rounded-full font-heading whitespace-nowrap">
                        <i className="hn hn-heart-solid text-pink-500 text-[10px]"></i>
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
                          className="w-12 h-12 rounded object-cover shrink-0"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold wrap-break-word text-gray-900">
                          {profile.songName}
                        </p>
                        <p className="text-xs text-gray-600 wrap-break-word">
                          {profile.songArtist}{" "}
                          {profile.songYear ? `(${profile.songYear})` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {profile.message && (
                  <div className="border-2 border-win-border-alt p-3 rounded-sm bg-white">
                    <h2 className="font-semibold text-xs text-gray-600 uppercase mb-1">
                      Message
                    </h2>
                    <p className="text-sm whitespace-pre-wrap wrap-break-word text-gray-800">
                      {profile.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col lg:flex-row lg:flex-wrap gap-3 mt-5 sm:mt-6">
                <button
                  type="button"
                  onClick={handleEditMelo}
                  className={actionButtonClass}
                  style={actionButtonStyle}
                >
                  <i className="hn hn-pencil-solid text-base"></i>
                  Edit Melo
                </button>

                <button
                  type="button"
                  onClick={handleEditRecommendation}
                  className={actionButtonClass}
                  style={actionButtonStyle}
                >
                  <i className="hn hn-music-solid text-base"></i>
                  Edit Recommendation
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSaveModalOpen(true);
                    playClickSound();
                  }}
                  className={actionButtonClass}
                  style={actionButtonStyle}
                >
                  <i className="hn hn-save-solid text-base"></i>
                  Save Account
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 w-full min-w-0 min-h-[160px]">
              <div className="text-gray-400 text-sm text-center">
                No Melo details found for this profile yet.
              </div>

              <div className="flex flex-col lg:flex-row lg:flex-wrap gap-3 mt-6 w-full">
                <button
                  type="button"
                  onClick={handleEditMelo}
                  className={actionButtonClass}
                  style={actionButtonStyle}
                >
                  <i className="hn hn-pencil-solid text-base"></i>
                  Edit Melo
                </button>

                <button
                  type="button"
                  onClick={handleEditRecommendation}
                  className={actionButtonClass}
                  style={actionButtonStyle}
                >
                  <i className="hn hn-music-solid text-base"></i>
                  Edit Recommendation
                </button>
              </div>
            </div>
          )}
        </div>
      </Window>

      <Popup
        title="Save Account"
        isOpen={isSaveModalOpen}
        onClose={closeSaveModal}
      >
        <form onSubmit={handleSaveAccount} className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Link an email and password to permanently save your account and
            access it anywhere.
          </p>

          {savingError && (
            <div className="p-2.5 bg-red-100 border border-red-400 text-red-700 text-xs rounded font-medium">
              {savingError}
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
              PASSWORD{" "}
              <span className="text-gray-400 text-xs">(min. 6 characters)</span>
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
              disabled={isSaving}
              className="px-4 py-3 text-sm font-bold border-2 border-win-border-dark rounded-sm bg-win-alt shadow-[3px_3px_0px_rgba(0,90,100,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] cursor-pointer text-gray-800 font-heading flex flex-row items-center justify-center gap-2 transition-transform disabled:opacity-50"
              style={actionButtonStyle}
            >
              {isSaving ? "Saving..." : "Confirm"}
            </button>
          </div>
        </form>
      </Popup>
    </div>
  );
}