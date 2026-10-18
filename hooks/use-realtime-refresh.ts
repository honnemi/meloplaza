"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type ChangePayload = RealtimePostgresChangesPayload<
  Record<string, unknown>
>;

export interface RealtimeSubscription {
  table: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  /** Return false to ignore an event (e.g. it's for a different room). */
  filter?: (payload: ChangePayload) => boolean;
  /** Runs for every event that passes the filter, before the refresh. */
  onEvent?: (payload: ChangePayload) => void;
}

/** The row an event is about: the old row for deletes, the new row otherwise. */
export function changedRow(payload: ChangePayload) {
  return (payload.eventType === "DELETE" ? payload.old : payload.new) as Record<
    string,
    unknown
  >;
}

/**
 * Subscribes to Postgres changes and re-runs the server components
 * (router.refresh) when something changes. Bursts of events are
 * collapsed into one refresh.
 */
export function useRealtimeRefresh(
  channelName: string,
  subscriptions: RealtimeSubscription[],
  debounceMs = 300,
) {
  const router = useRouter();

  // Keep the latest filter/onEvent callbacks without resubscribing every render
  const subscriptionsRef = useRef(subscriptions);
  subscriptionsRef.current = subscriptions;

  const subscriptionKey = subscriptions
    .map((sub) => `${sub.table}:${sub.event ?? "*"}`)
    .join(",");

  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const scheduleRefresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), debounceMs);
    };

    // Prefixed so it can never share a topic with another channel
    // (e.g. the "plaza" presence channel); Supabase reuses channels by name.
    let channel = supabase.channel(`db-changes:${channelName}`);

    subscriptionsRef.current.forEach((sub, index) => {
      channel = channel.on(
        "postgres_changes",
        {
          event: (sub.event ?? "*") as "*",
          schema: "public",
          table: sub.table,
        },
        (payload) => {
          const current = subscriptionsRef.current[index];

          if (current?.filter && !current.filter(payload)) return;

          current?.onEvent?.(payload);
          scheduleRefresh();
        },
      );
    });

    channel.subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [channelName, subscriptionKey, debounceMs, router]);
}