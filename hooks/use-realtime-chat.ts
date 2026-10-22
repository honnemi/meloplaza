"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const USER_TABLE = "Users";
const USER_COLUMNS = "id, display_name, colour";

export type ChatMessage = {
  id: string;
  user_id: string;
  room_id: string | null;
  text: string;
  created_at: string;
};

export type UserProfile = {
  id: string;
  display_name: string | null;
  colour: string | null;
};

const byCreatedAt = (a: ChatMessage, b: ChatMessage) =>
  new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

export function useChatMessages(roomId: string | null = null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);

  // Fetch each user profile only once
  const requestedProfiles = useRef<Set<string>>(new Set());

  // Messages: initial fetch + realtime inserts
  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const channel = supabase
      .channel(`chat:${roomId ?? "global"}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ChatMessages",
        },
        (payload) => {
          const message = payload.new as ChatMessage;

          // Only show messages for this room
          if (message.room_id !== roomId) return;

          setMessages((current) => {
            // Prevent duplicate messages
            if (current.some((item) => item.id === message.id)) {
              return current;
            }

            return [...current, message].sort(byCreatedAt);
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "ChatMessages" },
        (payload) => {
          const id = (payload.old as { id?: string }).id;
          if (!id) return;
          setMessages((current) => current.filter((m) => m.id !== id));
        },
      )
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || !active) return;

        // Fetch initial messages after subscribing
        let query = supabase
          .from("ChatMessages")
          .select("id, user_id, room_id, text, created_at");

        query = roomId
          ? query.eq("room_id", roomId)
          : query.is("room_id", null);

        const { data, error } = await query
          .order("created_at", { ascending: false })
          .limit(50);

        if (!active) return;

        if (error) {
          console.error("Error fetching messages:", error);
        } else {
          setMessages((current) => {
            const combined = new Map<string, ChatMessage>();

            // Include messages received while the fetch was running
            for (const message of current) {
              combined.set(message.id, message);
            }

            for (const message of [...(data ?? [])].reverse()) {
              combined.set(message.id, message as ChatMessage);
            }

            return Array.from(combined.values()).sort(byCreatedAt);
          });
        }

        setLoading(false);
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Profiles: fetch name + colour for any user we haven't seen yet
  useEffect(() => {
    const missing = [...new Set(messages.map((m) => m.user_id))].filter(
      (id) => !requestedProfiles.current.has(id),
    );

    if (missing.length === 0) return;

    missing.forEach((id) => requestedProfiles.current.add(id));

    const supabase = createClient();

    supabase
      .from(USER_TABLE)
      .select(USER_COLUMNS)
      .in("id", missing)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching profiles:", error);
          // Allow a retry the next time messages change.
          missing.forEach((id) => requestedProfiles.current.delete(id));
          return;
        }

        setUsers((current) => {
          const next = { ...current };
          for (const user of (data ?? []) as UserProfile[]) {
            next[user.id] = user;
          }
          return next;
        });
      });
  }, [messages]);

  return { messages, users, loading };
}
