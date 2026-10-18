"use client";

import {
  REALTIME_SUBSCRIBE_STATES,
  RealtimeChannel,
} from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { AVATAR_FACES } from "@/app/avatar-customisation";

import { createClient } from "@/lib/supabase/client";

/**
 * Throttle a callback to a certain delay, It will only call the callback if the delay has passed, with the arguments
 * from the last call
 */
const useThrottleCallback = <Params extends unknown[], Return>(
  callback: (...args: Params) => Return,
  delay: number,
) => {
  const lastCall = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttledCallback = useCallback(
    (...args: Params) => {
      const now = Date.now();
      const remainingTime = delay - (now - lastCall.current);

      if (remainingTime <= 0) {
        if (timeout.current) {
          clearTimeout(timeout.current);
          timeout.current = null;
        }

        lastCall.current = now;
        callback(...args);
      } else if (!timeout.current) {
        timeout.current = setTimeout(() => {
          lastCall.current = Date.now();
          timeout.current = null;
          callback(...args);
        }, remainingTime);
      }
    },
    [callback, delay],
  );

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return throttledCallback;
};

const supabase = createClient();

const EVENT_NAME = "realtime-cursor-move";

export interface CursorEventPayload {
  position: {
    x: number;
    y: number;
  };
  user: {
    id: string;
    name: string;
  };
  color: string;
  timestamp: number;
}

interface PlazaUser {
  id: string;
  displayName: string;
  colour: string;
  faceIndex: number;
}

export const usePlazaPresence = ({
  user,
  roomId = null,
  throttleMs = 50,
}: {
  user: PlazaUser | null;
  /** Leave empty for the main plaza; pass a room id to scope to that room. */
  roomId?: string | null;
  throttleMs?: number;
}) => {
  // Presence and cursors only reach people on the same channel, so each
  // room gets its own channel and the main plaza keeps "plaza".
  const channelName = roomId ? `plaza:room:${roomId}` : "plaza";

  const [onlineCount, setOnlineCount] = useState(0);

  const [cursors, setCursors] = useState<
    Record<string, CursorEventPayload>
  >({});

  const cursorPayload = useRef<CursorEventPayload | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);

  const channelReadyRef = useRef(false);

  // Keep the latest user in a ref so the Realtime
  // channel does not need to reconnect when the object changes.
  const userRef = useRef<PlazaUser | null>(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // SEND CURSOR POSITION

  const callback = useCallback(
    (event: MouseEvent) => {
      const currentUser = userRef.current;

      if (!currentUser || !channelReadyRef.current) {
        return;
      }

      const { clientX, clientY } = event;

      const payload: CursorEventPayload = {
        position: {
          x: clientX,
          y: clientY,
        },
        user: {
          id: currentUser.id,
          name: `${currentUser.displayName} + ${AVATAR_FACES[currentUser.faceIndex]}`,
        },
        color: currentUser.colour,
        timestamp: Date.now(),
      };

      cursorPayload.current = payload;

      channelRef.current?.send({
        type: "broadcast",
        event: EVENT_NAME,
        payload,
      });
    },
    [],
  );

  const handleMouseMove = useThrottleCallback(callback, throttleMs);

  // PRESENCE + REALTIME CURSORS

  useEffect(() => {
    if (!user?.id) {
      setOnlineCount(0);
      setCursors({});
      channelReadyRef.current = false;
      channelRef.current = null;
      return;
    }

    // Starting fresh on this channel (also runs when moving between rooms)
    setOnlineCount(0);
    setCursors({});

    const channel = supabase.channel(channelName);

    channel
      // Presence sync
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();

        // Count all users currently on this channel
        const count = Object.values(state).reduce(
          (total, presences) => total + presences.length,
          0,
        );

        setOnlineCount(count);
      })

      // User leaves
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        leftPresences.forEach((element) => {
          // Remove cursor when user leaves
          setCursors((prev) => {
            if (!prev[element.key]) {
              return prev;
            }

            const next = { ...prev };

            delete next[element.key];

            return next;
          });
        });

        const state = channel.presenceState();

        const count = Object.values(state).reduce(
          (total, presences) => total + presences.length,
          0,
        );

        setOnlineCount(count);
      })

      // User joins
      .on("presence", { event: "join" }, () => {
        const state = channel.presenceState();

        const count = Object.values(state).reduce(
          (total, presences) => total + presences.length,
          0,
        );

        setOnlineCount(count);
      })

      // Cursor movement
      .on(
        "broadcast",
        { event: EVENT_NAME },
        (data: { payload: CursorEventPayload }) => {
          const incomingUser = data.payload.user;

          // Don't render your own cursor
          if (incomingUser.id === user.id) {
            return;
          }

          setCursors((prev) => ({
            ...prev,
            [incomingUser.id]: data.payload,
          }));
        },
      );

    // Set the ref before subscribing so callbacks
    // can immediately use this channel.
    channelRef.current = channel;
    channelReadyRef.current = false;

    // Subscribe
    channel.subscribe(async (status) => {
      if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
        channelReadyRef.current = true;

        await channel.track({
          key: user.id,
        });
      } else {
        channelReadyRef.current = false;
        setOnlineCount(0);
        setCursors({});
        channelRef.current = null;
      }
    });

    return () => {
      channelReadyRef.current = false;
      channelRef.current = null;

      // removeChannel (not just unsubscribe) so the client forgets this
      // channel; otherwise re-entering the same room/plaza hands back the
      // old, already-subscribed channel and adding callbacks throws.
      supabase.removeChannel(channel);
    };
  }, [user?.id, channelName]);

  // Add event listener for mousemove
  useEffect(() => {
    if (!user) {
      return;
    }

    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [user?.id, handleMouseMove]);

  return {
    onlineCount,
    cursors,
  };
};