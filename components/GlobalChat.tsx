"use client";

import { useEffect, useRef, useState } from "react";
import { useChatMessages } from "@/hooks/use-realtime-chat";
import { addMessage } from "@/app/actions";

interface ChatProps {
  roomId: string | null;
  onClose: () => void;
}

const CHARACTER_LIMIT = 300;

const actionButtonStyle = {
  backgroundImage: "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
};

const stripesStyle = {
  backgroundImage:
    "repeating-linear-gradient(135deg, transparent 0px, transparent 3px, rgba(255,255,255,0.35) 3px, rgba(255,255,255,0.35) 5px)",
};

// Glossy window-control dots, same as the popup windows.
const glossyDot = (top: string, mid: string, bottom: string) => ({
  backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 25%, transparent 45%), linear-gradient(to bottom, ${top} 0%, ${mid} 45%, ${bottom} 100%)`,
});

const dotBase =
  "h-4 w-4 cursor-pointer rounded-full border transition-[filter,transform] duration-100 hover:-translate-y-[1px] hover:brightness-110 active:translate-y-[1px] active:brightness-95";

function playSound(src: string, volume = 0.2) {
  if (typeof window === "undefined") return;
  const audio = new Audio(src);
  audio.volume = volume;
  // Browsers can block autoplay; a failed sound shouldn't break the UI.
  audio.play().catch(() => {});
}

// Time only for today's messages; date + time for older ones.
const formatTimestamp = (date: string) => {
  const d = new Date(date);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (d.toDateString() === new Date().toDateString()) return time;

  const day = d.toLocaleDateString([], { day: "numeric", month: "short" });
  return `${day}, ${time}`;
};

export default function GlobalChat({ roomId, onClose }: ChatProps) {
  const { messages, users, loading } = useChatMessages(roomId);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const trimmed = message.trim();

  // Messages present when the chat first finished loading. Only messages
  // that arrive after this get the animation and sound, so opening the
  // chat doesn't play fifty sounds at once.
  const historyIds = useRef<Set<string> | null>(null);
  if (!loading && historyIds.current === null) {
    historyIds.current = new Set(messages.map((m) => m.id));
  }

  // Keep the newest message in view.
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMessage(e.target.value);
    playSound("/assets/type.mp3");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!trimmed || trimmed.length > CHARACTER_LIMIT || sending) return;

    playSound("/assets/click.mp3");
    setSending(true);

    try {
      const result = await addMessage(roomId, trimmed);

      if (!result.success) {
        console.error("Could not send message:", result);
        return;
      }

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="animate-popup-in relative flex max-h-[calc(100dvh-8rem)] w-100 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-md border-2 border-win-border-dark shadow-[4px_4px_0px_rgba(0,90,100,0.3)]">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b-2 border-win-border-dark bg-(image:--win-titlebar) p-3 text-lg font-bold shadow-[inset_0_1px_0px_rgba(255,255,255,0.9)] select-none">
        <span className="min-w-0 truncate font-heading leading-none">
          Global Chat
        </span>

        <div className="flex shrink-0 items-center gap-1.5 pl-4">
          <div
            className={`${dotBase} border-green-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(0,100,20,0.4),0_1px_2px_rgba(0,0,0,0.25)]`}
            style={glossyDot("#28CD41", "#34E050", "#DDFCE5")}
          />
          <div
            className={`${dotBase} border-amber-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(150,80,0,0.4),0_1px_2px_rgba(0,0,0,0.25)]`}
            style={glossyDot("#FFBD2E", "#FFCC4D", "#FFF6D6")}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className={`${dotBase} border-red-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(140,0,20,0.4),0_1px_2px_rgba(0,0,0,0.25)] outline-none`}
            style={glossyDot("#FF5F56", "#FF7B73", "#FFEBEA")}
          />
        </div>
      </div>

      {/* Main content */}
      <div
        className="relative min-h-0 flex-1 overflow-hidden bg-win p-2 shadow-[inset_0_1px_0px_rgba(255,255,255,0.7)]"
        style={stripesStyle}
      >
        <div className="relative z-10 h-full overflow-y-auto scroll-smooth rounded-sm border-2 border-win-border bg-white/60 p-4 shadow-[inset_1px_1px_0px_rgba(0,90,100,0.25),inset_-1px_-1px_0px_rgba(255,255,255,0.9)]">
      <div className="flex flex-col gap-3">
        <div
          ref={listRef}
          className="flex h-[200px] min-h-0 flex-col gap-2 overflow-y-auto rounded-sm border-2 border-win-alt bg-white p-3"
        >
          {loading && (
            <p className="text-sm text-gray-500">Loading messages...</p>
          )}

          {!loading && messages.length === 0 && (
            <p className="text-sm text-gray-500">
              No messages yet. Start the conversation!
            </p>
          )}

          {messages.map((item) => {
            const isNew =
              historyIds.current !== null && !historyIds.current.has(item.id);

            return (
            <div
              key={item.id}
              className={`break-words p-2 ${isNew ? "message-in" : ""}`}
              onAnimationStart={
                isNew ? () => playSound("/assets/msg.mp3") : undefined
              }
            >
              <p className="text-xs text-gray-500">
                <span
                  className="font-bold"
                  style={{ color: users[item.user_id]?.colour ?? undefined }}
                >
                  {users[item.user_id]?.display_name ?? "User"}
                </span>{" "}
                · {formatTimestamp(item.created_at)}
              </p>
              <p>{item.text}</p>
            </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <form
            onSubmit={handleSubmit}
            className="flex flex-row items-center gap-2"
          >
            <input
              className="text-input w-full rounded-sm border-2 border-gray-500 border-t-gray-600 border-l-gray-600 border-b-gray-300 border-r-gray-300 p-3 transition-all duration-150 focus:border-blue-500 focus:outline-none"
              placeholder="Enter message..."
              value={message}
              onChange={handleChange}
              maxLength={CHARACTER_LIMIT}
            />

            <button
              type="submit"
              disabled={!trimmed || sending}
              className="flex flex-row items-center justify-center gap-2 rounded-sm border-2 border-win-border-dark bg-win-alt px-4 py-3 font-heading text-sm font-bold text-gray-800 shadow-[3px_3px_0px_rgba(0,90,100,0.3)] transition-transform hover:-translate-y-[1px] hover:cursor-pointer active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50"
              style={actionButtonStyle}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>

          <span className={`text-xs transition-all duration-150 ${
              message.length >= CHARACTER_LIMIT
                ? "text-[#FF2D55]"
                : "text-gray-600"
            }`}></span>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}