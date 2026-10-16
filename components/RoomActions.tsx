
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinRoom, leaveRoom } from "@/app/actions";
import Button from "@/components/Button";

export default function RoomActions({
    roomId,
    isMember,
}: {
    roomId: string;
    isMember: boolean;
}) {
    const router = useRouter();
    const [joined, setJoined] = useState(isMember);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");

    function handleToggleMembership() {
        setError("");

        startTransition(async () => {
            try {
                if (joined) {
                    await leaveRoom(roomId);
                    setJoined(false);
                } else {
                    await joinRoom(roomId);
                    setJoined(true);
                }

                router.refresh();
            } catch {
                setError("Unable to update room membership. Please try again.");
            }
        });
    }

    function returnToPlaza() {
        router.push("/plaza");
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex justify-center gap-2">
                <Button
                    label={
                        isPending
                            ? "Please wait..."
                            : joined
                              ? "Leave room"
                              : "Join room"
                    }
                    onClick={handleToggleMembership}
                    disabled={isPending}
                />

                <Button
                    label="Return to plaza"
                    onClick={returnToPlaza}
                />
            </div>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}
