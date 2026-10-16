"use client"

import Window from "@/components/Window"
import RoomCard from "@/components/RoomCard"
import Button from "@/components/Button"
import Popup from "@/components/PopupWindow"
import { useState } from "react";

interface Room {
    id: any;
    createdAt: any;
    name: any;
    description: any;
    capacity: any;
}

interface RoomWindowProps {
    rooms?: Room[];
}

export default function RoomWindow({ rooms = [] }: RoomWindowProps) {

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Play sound on lick
    function playClickSound() {
        if (typeof window !== "undefined") {
            const clickAudio = new Audio("/assets/click.mp3");
            clickAudio.volume = 0.2;
            clickAudio
                .play()
                .catch((err) => console.error("Audio blocked by browser:", err));
        }
    }

    const closeAddModal = () => {
        playClickSound();
    };

    return (
        <Window title="Rooms" footer={
            <div className="flex justify-between w-full">
                <Button label="Back" href="/plaza" />
            </div>
        }>
            <div className="flex flex-row justify-end p-4">
                <button
                    type="button"
                    onClick={() => {
                        setIsAddModalOpen(true);
                        playClickSound();
                    }}
                    className="px-4 py-3 text-sm font-bold border-2 border-win-border-dark rounded-sm bg-win-alt shadow-[3px_3px_0px_rgba(0,90,100,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] cursor-pointer text-gray-800 font-heading flex flex-row items-center justify-center gap-2 transition-transform disabled:opacity-50"
                    style={{
                        backgroundImage:
                            "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
                    }}
                >
                    <i className="hn hn-plus-solid">
                    </i>Add New Room
                </button>
            </div>
            {rooms.map((room) => (
                <RoomCard key={room.id} name={room.name} description={room.description} capacity={room.capacity} />
            ))
            }
            <Popup
                title="Save Account"
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
            >
                <form className="flex flex-col gap-4">
                    <p className="text-sm text-gray-600">
                        Link an email and password to permanently save your account and
                        access it anywhere.
                    </p>


                    <div className="flex flex-col gap-1">
                        <label className="font-heading text-sm font-semibold text-gray-600">
                            EMAIL
                        </label>
                        <input
                            type="email"
                            required
                            className="text-input"
                            placeholder="melo@example.com"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-heading text-sm font-semibold text-gray-600">
                            PASSWORD{" "}
                            <span className="text-gray-400 text-xs">(min. 6 characters)</span>
                        </label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="text-input"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="submit"
                            className="px-4 py-3 text-sm font-bold border-2 border-win-border-dark rounded-sm bg-win-alt shadow-[3px_3px_0px_rgba(0,90,100,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] cursor-pointer text-gray-800 font-heading flex flex-row items-center justify-center gap-2 transition-transform disabled:opacity-50"
                            style={{
                                backgroundImage:
                                    "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
                            }}
                        >
                        </button>
                    </div>
                </form>
            </Popup>
        </Window>
    )
}