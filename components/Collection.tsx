"use client";

import Window from "@/components/Window";
import Button, { SecondaryButton } from "@/components/Button";
import CD from "@/components/CD";
import Avatar from "@/components/Avatar";
import Popup from "@/components/PopupWindow";

import { useState } from "react";
import { getUserById } from "@/app/actions";

export interface CollectionItem {
  id: string;
  recommendation: string; // original recommendation ID for analytics/counting
  song_name: string;
  song_artist: string;
  song_album: string;
  song_album_cover: string;
  song_year: string;
  added_at: Date;
  original_creator_id: string;
  prompt: string;
  message: string;
  original_creator?: {
    id: string;
    display_name: string;
    colour: string;
    face_index: number;
  };
}

interface CollectionProps {
  collection: CollectionItem[];
}

export default function Collection({ collection }: CollectionProps) {
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [selectedUser, setSelectedUser] = useState<CollectionItem["original_creator"] | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Play sound on click
  function playClickSound() {
    if (typeof window !== "undefined") {
      const clickAudio = new Audio("/assets/click.mp3");
      clickAudio.volume = 0.2;
      clickAudio
        .play()
        .catch((err) => console.error("Audio blocked by browser:", err));
    }
  }

  // Open details popup for selected song and fetch user data
  const openPopup = async (item: CollectionItem) => {
    setSelectedItem(item);
    playClickSound();

    // If the creator data wasn't fully preloaded, fetch it using original_creator_id
    if (item.original_creator) {
      setSelectedUser(item.original_creator);
    } else if (item.original_creator_id) {
      setLoadingUser(true);
      const user = await getUserById(item.original_creator_id);
      setSelectedUser(user);
      setLoadingUser(false);
    }
  };

  // Close popup and reset selected state
  const closePopup = () => {
    setSelectedItem(null);
    setSelectedUser(null);
    playClickSound();
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 sm:p-12">
      <Window
        title="My Collection"
        icon={<i className="hn hn-folder-solid"></i>}
        footer={
          <div className="flex justify-between w-full">
            <Button label="Back" href="/plaza" />
            <SecondaryButton
              label="Print"
              href="/collection/print"
              icon={<i className="hn hn-print-solid"></i>}
            />
          </div>
        }
      >
        {/* Display message if collection is empty, otherwise show grid of songs */}
        {collection.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-center text-gray-400">
              Your collection is empty.
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-[repeat(auto-fit,minmax(140px,1fr))]
              gap-x-6
              gap-y-10
              w-full
              max-w-190
              mx-auto
              p-2
              sm:p-4
            "
          >
            {collection.map((item) => (
              <div
                key={item.id}
                className="
                  flex
                  flex-col
                  gap-3
                  items-center
                  text-center
                  min-w-0
                "
              >
                {/* Song */}
                <div
                  className="
                    relative
                    w-full
                    max-w-40
                    aspect-square
                    group
                    cursor-pointer
                  "
                  onClick={() => openPopup(item)}
                >
                  {/* CD */}
                  <div
                    className="
                      absolute
                      top-1/2
                      right-0
                      -translate-y-1/2
                      z-0
                      transition-all
                      duration-200
                      group-hover:right-[-20px]
                    "
                  >
                    <CD />
                  </div>

                  {/* Album cover */}
                  <img
                    src={item.song_album_cover}
                    alt={item.song_name}
                    className="
                      relative
                      z-10
                      w-full
                      h-full
                      object-cover
                      shadow-[0_4px_6px_rgba(0,90,100,0.3),inset_0_1px_0px_rgba(255,255,255,0.9)]
                    "
                  />
                </div>

                {/* Song name + artist */}
                <div className="min-w-0 w-full max-w-40">
                  <p className="text-sm font-bold truncate">
                    {item.song_name}
                  </p>

                  <p className="text-sm text-gray-600 truncate">
                    {item.song_artist}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Window>

      {/* Song details popup */}
      <Popup
        title="Details"
        isOpen={selectedItem !== null}
        onClose={closePopup}
      >
        {selectedItem && (
          <div className="flex flex-col">
            {/* Song details */}
            <section className="flex flex-col gap-3 pb-5 border-b border-gray-300">
              <div className="font-heading font-semibold text-xs text-gray-600 uppercase">
                SONG
              </div>

              <div className="flex flex-row gap-4 items-start">
                <img
                  src={selectedItem.song_album_cover}
                  alt={selectedItem.song_name}
                  className="w-20 h-20 object-cover shrink-0 rounded"
                />

                <div className="min-w-0">
                  <p className="text-lg font-bold">{selectedItem.song_name}</p>

                  <p className="text-sm text-gray-600">
                    {selectedItem.song_artist}
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    {selectedItem.song_album} · {selectedItem.song_year}
                  </p>
                </div>
              </div>
            </section>

            {/* Recommended by */}
            <section className="flex flex-col gap-3 py-5 border-b border-gray-300">
              {loadingUser ? (
                <p className="text-sm text-gray-400">Loading user...</p>
              ) : selectedUser ? (
                <div className="flex flex-row items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 shrink-0">
                    <Avatar
                      colour={selectedUser.colour}
                      faceIndex={selectedUser.face_index}
                      size="size-12"
                      textSize="text-sm"
                    />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="font-bold truncate"
                      style={{ color: selectedUser.colour }}
                    >
                      {selectedUser.display_name}
                    </p>

                    <p className="text-xs text-gray-600">
                      shared this song with you
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  User information unavailable.
                </p>
              )}
            </section>

            {/* Recommendation context */}
            <section className="flex flex-col gap-3 pt-5">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-heading text-xs font-semibold text-gray-600 mb-1">
                    PROMPT
                  </p>

                  <p className="text-sm leading-5">{selectedItem.prompt}</p>
                </div>

                <div>
                  <p className="font-heading text-xs font-semibold text-gray-600 mb-1">
                    MESSAGE
                  </p>

                  <p className="text-sm leading-5">{selectedItem.message}</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </Popup>
    </div>
  );
}