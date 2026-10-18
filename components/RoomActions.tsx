"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinRoom, leaveRoom } from "@/app/actions";
import Button, { SecondaryButton } from "@/components/Button";

export default function RoomActions({
  roomId,
  isMember,
  isOwner,
}: {
  roomId: string;
  isMember: boolean;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [joined, setJoined] = useState(isMember);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Keep the button in step with the server after a realtime refresh
  useEffect(() => {
    setJoined(isMember);
  }, [isMember]);

  function handleToggleMembership() {
    setError("");

    startTransition(async () => {
      try {
        const result = joined
          ? await leaveRoom(roomId)
          : await joinRoom(roomId);

        if (!result?.success) {
          setError(result?.error || "Unable to update room membership.");
          return;
        }

        setJoined(!joined);
        router.refresh();
      } catch (err) {
        console.error("Room membership error:", err);
        setError("Unable to update room membership. Please try again.");
      }
    });
  }

  function returnToPlaza() {
    router.push("/plaza");
  }

  return (
    <div className="flex w-full min-w-0 flex-col items-end gap-2">
      <div className="flex max-w-full flex-wrap justify-end gap-2">
        {!isOwner && (
          <SecondaryButton
            label={
              isPending ? "Please wait..." : joined ? "Leave room" : "Join room"
            }
            onClick={handleToggleMembership}
            disabled={isPending}
          />
        )}

        <Button label="Return to plaza" onClick={returnToPlaza} />
      </div>

      {error && (
        <p className="max-w-full break-words text-right text-sm text-[#a3326f]">
          {error}
        </p>
      )}
    </div>
  );
}
