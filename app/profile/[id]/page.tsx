"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getUserById,
  getUserRecommendationById,
  addToCollection,
  isInCollection,
} from "@/app/actions";
import Window from "@/components/Window";
import Button, { SecondaryButton } from "@/components/Button";
import Avatar from "@/components/Avatar";
import MusicPlayer from "@/components/MusicPlayer";

export default function ShowRecommendation() {
  const params = useParams();
  const id = params.id?.toString();

  const [otherUser, setOtherUser] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [addedToCollection, setAddedToCollection] = useState(false);
  const [checkingCollection, setCheckingCollection] = useState(true);
  const [addingToCollection, setAddingToCollection] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      const [recommendationData, otherUserData] = await Promise.all([
        getUserRecommendationById(id),
        getUserById(id),
      ]);

      if (recommendationData) {
        const alreadyAdded = await isInCollection(recommendationData.id);
        setAddedToCollection(alreadyAdded);
      }

      setRecommendation(recommendationData);
      setOtherUser(otherUserData);
      setCheckingCollection(false);
    };

    loadData();
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
      <div className="flex min-h-screen w-full items-center justify-center text-2xl font-bold">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 sm:p-12">
      <Window
        title="Chatting..."
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <Button label="Back" href="/plaza" />
          </div>
        }
      >
        <div className="flex flex-row w-full h-full gap-4">
          <div className="flex flex-col border-2 border-gray-300 overflow-y-auto h-full w-full rounded-sm p-4 gap-4">
            <div className="message-in" style={{ animationDelay: "0ms" }}>
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

            <div className="message-in" style={{ animationDelay: "1000ms" }}>
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

            <div className="message-in" style={{ animationDelay: "2000ms" }}>
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

            <div className="message-in" style={{ animationDelay: "3000ms" }}>
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

            <div className="message-in" style={{ animationDelay: "4000ms" }}>
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

            <div className="message-in" style={{ animationDelay: "5000ms" }}>
              <MusicPlayer
                songId={recommendation.song_id}
                songName={recommendation.song_name}
                songArtist={recommendation.song_artist}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center w-40 h-40 border-2 border-gray-300 rounded-sm">
                <Avatar
                  colour={otherUser.colour}
                  faceIndex={otherUser.face_index}
                />
              </div>

              <p className="font-bold">{otherUser.display_name}</p>
            </div>

            <SecondaryButton
              label={
                addedToCollection
                  ? "Added to Collection"
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

            <Button
              label="Recommend a Song Back"
              icon={<i className="hn hn-share-alt-solid" />}
            />
          </div>
        </div>
      </Window>
    </div>
  );
}
