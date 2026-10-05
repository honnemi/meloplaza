"use client";

import { useEffect, useRef, useState } from "react";
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
import LoadingScreen from "@/components/LoadingScreen";

// Play sound on message animation start
function playMessageSound() {
  if (typeof window !== "undefined") {
    const messageAudio = new Audio("/assets/msg.mp3");
    messageAudio.volume = 0.5;
    messageAudio
      .play()
      .catch((err) => console.error("Audio blocked by browser:", err));
  }
}

// Store replies to show after user adds recommendation to collection
const REPLIES = [
  "Thanks for the recommendation!",
  "I've added it to my collection ♡",
];

// Number of entries in the `messages` array built in the component
// The music player's animation delay is MESSAGE_COUNT * 1000ms
const MESSAGE_COUNT = 5;

// Format date
const formatTime = (date: string | Date) =>
  new Date(date).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

// Make display name colour match avatar colour
const nameColour = (colour?: string) => colour;

// ChatLine component to display single chat message
interface ChatLineProps {
  name?: string;
  colour?: string;
  text: string;
  time: string;
  align?: "left" | "right";
  style?: React.CSSProperties;
  onAnimationStart?: () => void;
}

function ChatLine({
  name,
  colour,
  text,
  time,
  align = "left",
  style,
}: ChatLineProps) {
  const right = align === "right";

  return (
    <div
      className={`message-in ${right ? "flex justify-end" : ""}`}
      style={style}
      onAnimationStart={playMessageSound}
    >
      {/* Display name */}
      <div className={right ? "max-w-[85%]" : undefined}>
        <p className="text-gray-900 wrap-break-word">
          <span className="font-bold" style={{ color: nameColour(colour) }}>
            {name}:
          </span>{" "}
          {/* Message text */}
          {text}
        </p>

        {/* Timestamp */}
        <p className={`text-xs text-gray-600 ${right ? "text-right" : ""}`}>
          {time}
        </p>
      </div>
    </div>
  );
}

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
  const [replyTime, setReplyTime] = useState(() => new Date());

  // Scroll to bottom of chat when new messages are added
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const el = chatRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const ready = !!otherUser && !!recommendation && !checkingCollection;

  // Display messages with delays unless the recommendation has already been added to collection
  useEffect(() => {
    if (!ready) return;

    const delay = skipDelays ? 0 : MESSAGE_COUNT * 1000 + 100;
    const t = setTimeout(scrollToBottom, delay);

    return () => clearTimeout(t);
  }, [ready, skipDelays]);

  // Scroll to bottom when recommendation is added to collection
  useEffect(() => {
    if (!addedToCollection) return;

    const raf = requestAnimationFrame(scrollToBottom);
    return () => cancelAnimationFrame(raf);
  }, [addedToCollection]);

  // Get recommendation and user data when component mounts
  useEffect(() => {
    if (!id) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const loadData = async () => {
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) return;

      const [currentUserData, recommendationData, otherUserData] =
        await Promise.all([
          getUserById(currentUserId),
          getUserRecommendationById(id),
          getUserById(id),
        ]);

      const alreadyAdded = recommendationData
        ? await isInCollection(recommendationData.id)
        : false;

      setAddedToCollection(alreadyAdded);
      setRecommendation(recommendationData);
      setOtherUser(otherUserData);
      setCurrentUser(currentUserData);
      setCheckingCollection(false);

      if (alreadyAdded) {
        setSkipDelays(true);
        setShowActions(true);
      } else {
        timer = setTimeout(() => setShowActions(true), 6000);
      }
    };

    loadData();

    return () => clearTimeout(timer);
  }, [id]);

  // Handle adding recommendation to collection
  const handleAddToCollection = async () => {
    if (!recommendation?.id || addingToCollection || addedToCollection) return;

    setAddingToCollection(true);

    const result = await addToCollection(recommendation.id);

    if (result.success) {
      setReplyTime(new Date());
      setAddedToCollection(true);
    } else {
      console.error(result.error);
    }

    setAddingToCollection(false);
  };

  // Show loading screen if data is still being fetched
  if (!otherUser || !recommendation || checkingCollection) {
    return (
      <LoadingScreen />
    );
  }

  // Messages to display in chat
  const messages = [
    "Hi!",
    `${recommendation.prompt} is...`,
    `${recommendation.song_name} by ${recommendation.song_artist} (｡•̀ᴗ-)✧`,
    recommendation.message,
    "Give it a listen and tell me what you think!",
  ];

  // When recommendation already added, skip message animations
  const getMessageStyle = (delay: number) => ({
    animationDelay: skipDelays ? "0ms" : `${delay}ms`,
    animationDuration: skipDelays ? "0ms" : undefined,
  });

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 pb-10 sm:p-12">
      <Window
        title="MeloMessenger"
        icon={<i className="hn hn-message-solid"></i>}
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <Button label="Back" href="/plaza" />
          </div>
        }
      >
        <div className="flex flex-col md:flex-row w-full h-full gap-4">
          {/* Chat */}
          <div
            ref={chatRef}
            className="flex flex-col overflow-y-auto min-h-100 md:h-full w-full md:flex-1 min-w-0 p-4 gap-4 rounded-sm bg-white border-2 border-t-win-border-dark border-l-win-border-dark border-b-win-border-alt border-r-win-border-alt"
          >
            {messages.map((text, i) => (
              <ChatLine
                key={i}
                name={otherUser.display_name}
                colour={otherUser.colour}
                text={text}
                time={formatTime(recommendation.created_at)}
                style={getMessageStyle(i * 1000)}
              />
            ))}

            {/* Song preview */}
            <div
              className="message-in py-4"
              style={getMessageStyle(messages.length * 1000)}
              onAnimationStart={playMessageSound}
            >
              <MusicPlayer
                songId={recommendation.song_id}
                songName={recommendation.song_name}
                songArtist={recommendation.song_artist}
              />
            </div>

            {/* Replies */}
            {addedToCollection &&
              REPLIES.map((text, i) => (
                <ChatLine
                  key={text}
                  align="right"
                  name={currentUser?.display_name}
                  colour={currentUser?.colour}
                  text={text}
                  time={formatTime(replyTime)}
                  onAnimationStart={playMessageSound}
                  style={getMessageStyle(i * 1000)}
                />
              ))}
          </div>

          {/* Right side */}
          <div className="flex flex-col justify-center gap-4 w-full md:w-40 shrink-0 pb-4 md:pb-0">
            {/* Profile */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center w-40 h-40 bg-white border-2 border-win-border-alt rounded-sm">
                <Avatar
                  colour={otherUser.colour}
                  faceIndex={otherUser.face_index}
                />
              </div>

              <p className="font-bold text-center text-gray-900 w-full max-w-40 wrap-break-word">
                {otherUser.display_name}
              </p>
            </div>

            {/* Add to collection button*/}
            <div
              className={`w-full transition-all duration-500 ${
                showActions
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-3 pointer-events-none"
              }`}
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
