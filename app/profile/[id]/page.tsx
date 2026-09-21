"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getUserById,
  getUserRecommendationById,
  addToCollection,
  isInCollection,
  getCurrentUserId,
} from "@/app/actions";
import Window from "@/components/Window";
import Button, { SecondaryButton } from "@/components/Button";
import Avatar from "@/components/Avatar";
import MusicPlayer from "@/components/MusicPlayer";

export default function ShowRecommendation() {
  const params = useParams();
  const id = params.id?.toString();

  const [otherUser, setOtherUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [addedToCollection, setAddedToCollection] = useState(false);
  const [checkingCollection, setCheckingCollection] = useState(true);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [skipDelays, setSkipDelays] = useState(false);

  useEffect(() => {
    if (!id) return;

    let timer: NodeJS.Timeout;

    const loadData = async () => {
      const currentUserId = await getCurrentUserId();

      if (!currentUserId) {
        return;
      }

      const currentUserData = await getUserById(currentUserId);

      const [recommendationData, otherUserData] = await Promise.all([
        getUserRecommendationById(id),
        getUserById(id),
      ]);

      let alreadyAdded = false;

      if (recommendationData) {
        alreadyAdded = await isInCollection(recommendationData.id);
        setAddedToCollection(alreadyAdded);
      }

      setRecommendation(recommendationData);
      setOtherUser(otherUserData);
      setCurrentUser(currentUserData);
      setCheckingCollection(false);

      if (alreadyAdded) {
        // Already collected: show everything immediately
        setSkipDelays(true);
        setShowActions(true);
      } else {
        // New recommendation: keep the normal reveal delay
        timer = setTimeout(() => {
          setShowActions(true);
        }, 6000);
      }
    };

    loadData();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [id]);

  const handleAddToCollection = async () => {
    if (!recommendation?.id || addingToCollection || addedToCollection) {
      return;
    }

    setAddingToCollection(true);

    const result = await addToCollection(recommendation.id);

    if (result.success) {
      setAddedToCollection(true);
    } else {
      console.error(result.error);
    }

    setAddingToCollection(false);
  };

  if (!otherUser || !recommendation || checkingCollection) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center text-2xl font-bold cursor-wait">
        Loading...
      </div>
    );
  }

  // When already added, remove all message animation delays.
  // Otherwise keep the normal 0–5000ms sequence.
  const getMessageStyle = (delay: number) => ({
    animationDelay: skipDelays ? "0ms" : `${delay}ms`,
    animationDuration: skipDelays ? "0ms" : undefined,
  });

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 pb-10 sm:p-12">
      <Window
        title="MeloMessenger"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <Button label="Back" href="/plaza" />
          </div>
        }
      >
        <div className="flex flex-col md:flex-row w-full h-full gap-4">

          {/* CHAT */}
          <div className="flex flex-col border-2 border-gray-300 overflow-y-auto min-h-100 md:h-full w-full md:flex-1 rounded-sm p-4 gap-4 min-w-0">

            {/* MESSAGE 1 */}
            <div
              className="message-in"
              style={getMessageStyle(0)}
            >
              <p>
                <span
                  className="font-bold"
                  style={{ color: otherUser.colour }}
                >
                  {otherUser.display_name}:
                </span>{" "}
                Hi!
              </p>

              <p className="text-xs text-gray-500">
                {new Date(recommendation.created_at).toLocaleString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* MESSAGE 2 */}
            <div
              className="message-in"
              style={getMessageStyle(1000)}
            >
              <p>
                <span
                  className="font-bold"
                  style={{ color: otherUser.colour }}
                >
                  {otherUser.display_name}:
                </span>{" "}
                {recommendation.prompt} is...
              </p>

              <p className="text-xs text-gray-500">
                {new Date(recommendation.created_at).toLocaleString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* MESSAGE 3 */}
            <div
              className="message-in"
              style={getMessageStyle(2000)}
            >
              <p>
                <span
                  className="font-bold"
                  style={{ color: otherUser.colour }}
                >
                  {otherUser.display_name}:
                </span>{" "}
                {recommendation.song_name} by {recommendation.song_artist}{" "}
                (｡•̀ᴗ-)✧
              </p>

              <p className="text-xs text-gray-500">
                {new Date(recommendation.created_at).toLocaleString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* MESSAGE 4 */}
            <div
              className="message-in"
              style={getMessageStyle(3000)}
            >
              <p>
                <span
                  className="font-bold"
                  style={{ color: otherUser.colour }}
                >
                  {otherUser.display_name}:
                </span>{" "}
                {recommendation.message}
              </p>

              <p className="text-xs text-gray-500">
                {new Date(recommendation.created_at).toLocaleString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* MESSAGE 5 */}
            <div
              className="message-in"
              style={getMessageStyle(4000)}
            >
              <p>
                <span
                  className="font-bold"
                  style={{ color: otherUser.colour }}
                >
                  {otherUser.display_name}:
                </span>{" "}
                Give it a listen and tell me what you think!
              </p>

              <p className="text-xs text-gray-500">
                {new Date(recommendation.created_at).toLocaleString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* MUSIC PLAYER */}
            <div
              className="message-in py-4"
              style={getMessageStyle(5000)}
            >
              <MusicPlayer
                songId={recommendation.song_id}
                songName={recommendation.song_name}
                songArtist={recommendation.song_artist}
              />
            </div>

            {/* CURRENT USER MESSAGES */}
            {addedToCollection && (
              <>
                <div className="flex justify-end message-out">
                  <div className="max-w-[85%]">
                    <p>
                      <span
                        className="font-bold"
                        style={{ color: currentUser?.colour }}
                      >
                        {currentUser?.display_name}:
                      </span>{" "}
                      Thanks for the recommendation!
                    </p>

                    <p className="text-xs text-gray-500 text-right">
                      {new Date().toLocaleString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end message-out">
                  <div className="max-w-[85%]">
                    <p>
                      <span
                        className="font-bold"
                        style={{ color: currentUser?.colour }}
                      >
                        {currentUser?.display_name}:
                      </span>{" "}
                      I've added it to my collection ♡
                    </p>

                    <p className="text-xs text-gray-500 text-right">
                      {new Date().toLocaleString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* PROFILE + ACTIONS */}
          <div className="flex flex-col justify-center gap-4 w-full md:w-40 shrink-0 pb-4 md:pb-0">

            {/* PROFILE */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center w-40 h-40 border-2 border-gray-300 rounded-sm">
                <Avatar
                  colour={otherUser.colour}
                  faceIndex={otherUser.face_index}
                />
              </div>

              <p className="font-bold text-center w-full max-w-40 break-words whitespace-normal">
                {otherUser.display_name}
              </p>
            </div>

            {/* ACTIONS */}
            <div
              className={`
                w-full
                transition-all duration-500
                ${
                  showActions
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3 pointer-events-none"
                }
              `}
            >
              <div className="flex flex-col items-center w-full">
                <SecondaryButton
                  label={
                    addedToCollection
                      ? "Added"
                      : addingToCollection
                        ? "Adding..."
                        : "Add to Collection"
                  }
                  icon={
                    <i
                      className={
                        addedToCollection
                          ? "hn hn-check-solid"
                          : "hn hn-save-solid"
                      }
                    />
                  }
                  onClick={handleAddToCollection}
                  disabled={addingToCollection || addedToCollection}
                />
              </div>
            </div>
          </div>
        </div>
      </Window>
    </div>
  );
}