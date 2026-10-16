
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Window from "@/components/Window";
import RoomCard from "@/components/RoomCard";
import Button from "@/components/Button";
import Popup from "@/components/PopupWindow";
import { joinRoom, leaveRoom } from "@/app/actions";

interface Room {
    id: string;
    createdAt: string;
    name: string;
    description: string;
    capacity: number;
    memberCount: number;
    isMember: boolean;
}

interface RoomWindowProps {
    rooms?: Room[];
}

export default function RoomWindow({ rooms = [] }: RoomWindowProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    function playClickSound() {
        if (typeof window !== "undefined") {
            const clickAudio = new Audio("/assets/click.mp3");
            clickAudio.volume = 0.2;
            clickAudio.play().catch(() => { });
        }
    }

    function handleJoin(roomId: string) {
        setMessage("");
        playClickSound();
        router.push(`/room/${roomId}`);
    }


    const closeAddModal = () => {
        setIsAddModalOpen(false);
        playClickSound();
    };

    return (
        <Window
            title="Rooms"
            icon={<i className="hn hn-users-solid"/>}
            footer={
                <div className="flex justify-between w-full">
                    <Button label="Back" href="/plaza" />
                </div>
            }
        >
            <div className="flex flex-col h-full min-h-0">
                <div className="flex justify-end p-4 shrink-0">
                    <button
                        type="button"
                        onClick={() => {
                            setIsAddModalOpen(true);
                            playClickSound();
                        }}
                        className="px-4 py-3 text-sm font-bold border-2 border-win-border-dark rounded-sm bg-win-alt shadow-[3px_3px_0px_rgba(0,90,100,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] cursor-pointer text-gray-800 font-heading flex flex-row items-center justify-center gap-2 transition-transform"
                        style={{
                            backgroundImage:
                                "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
                        }}
                    >
                        <i className="hn hn-plus-solid" />
                        Add New Room
                    </button>
                </div>

                {message && (
                    <p role="alert" className="px-4 pb-3 text-sm text-red-600">
                        {message}
                    </p>
                )}

                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                    {rooms.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">
                            No rooms found.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {rooms.map((room) => (
                                <RoomCard
                                    key={room.id}
                                    id={room.id}
                                    name={room.name}
                                    description={room.description}
                                    capacity={room.capacity}
                                    memberCount={room.memberCount}
                                    isMember={room.isMember}
                                    isPending={isPending}
                                    onJoin={() => handleJoin(room.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Popup
                title="Add New Room"
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
            >
                <form className="flex flex-col gap-4">
                    <p className="text-sm text-gray-600">
                        Create a room for people to join and share similar music with.
                    </p>

                    <div className="flex flex-col gap-1">
                        <label className="font-heading text-sm font-semibold text-gray-600">
                            ROOM NAME
                        </label>
                        <input
                            type="text"
                            required
                            className="text-input"
                            placeholder="Room name"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-heading text-sm font-semibold text-gray-600">
                            DESCRIPTION
                        </label>
                        <textarea
                            required
                            className="text-input"
                            placeholder="Describe your room"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-heading text-sm font-semibold text-gray-600">
                            CAPACITY
                        </label>
                        <input
                            type="number"
                            required
                            min={1}
                            max={50}
                            className="text-input"
                            placeholder="10"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="submit"
                            className="px-4 py-3 text-sm font-bold border-2 border-win-border-dark rounded-sm bg-win-alt shadow-[3px_3px_0px_rgba(0,90,100,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] cursor-pointer text-gray-800 font-heading"
                            style={{
                                backgroundImage:
                                    "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
                            }}
                        >
                            Create Room
                        </button>
                    </div>
                </form>
            </Popup>
        </Window>
    );
}
