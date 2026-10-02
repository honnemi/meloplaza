"use client";

import Window from "@/components/Window";
import Button from "@/components/Button";
import CD from "@/components/CD";
import Avatar from "@/components/Avatar";
import Popup from "@/components/PopupWindow";

import { useState } from "react";
import { getUserById } from "@/app/actions";

export interface CollectionItem {
  recommendation: string;
  Recommendations: {
    id: string;
    song_name: string;
    song_artist: string;
    song_album: string;
    song_album_cover: string;
    song_year: string;
    created_at: Date;
    created_by: string;
    prompt: string;
    message: string;
  };
}

interface CollectionProps {
  collection: CollectionItem[];
}

export interface SelectedUser {
  id: string;
  display_name: string;
  colour: string;
  face_index: number;
}

export default function Collection({ collection }: CollectionProps) {
  const [selectedSong, setSelectedSong] = useState<
    CollectionItem["Recommendations"] | null
  >(null);

  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);

  const [loadingUser, setLoadingUser] = useState(false);

  const openPopup = async (
    recommendation: CollectionItem["Recommendations"],
  ) => {
    setSelectedSong(recommendation);
    setLoadingUser(true);

    const user = await getUserById(recommendation.created_by);

    setSelectedUser(user);
    setLoadingUser(false);
  };

  const closePopup = () => {
    setSelectedSong(null);
    setSelectedUser(null);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 sm:p-12">
      <Window
        title="My Collection"
        icon={<i className="hn hn-folder-solid"></i>}
        footer={
          <div className="flex justify-between w-full">
            <Button label="Back" href="/plaza" />
          </div>
        }
      >
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
            {collection.map((item) => {
              const recommendation = item.Recommendations;

              return (
                <div
                  key={item.recommendation}
                  className="
                    flex
                    flex-col
                    gap-3
                    items-center
                    text-center
                    min-w-0
                  "
                >
                  {/* Album (song) */}
                  <div
                    className="
                      relative
                      w-full
                      max-w-40
                      aspect-square
                      group
                      cursor-pointer
                    "
                    onClick={() => openPopup(recommendation)}
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
                      src={recommendation.song_album_cover}
                      alt={recommendation.song_name}
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
                      {recommendation.song_name}
                    </p>

                    <p className="text-sm text-gray-600 truncate">
                      {recommendation.song_artist}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Window>

      {/* Song details popup */}
      <Popup
        title="Details"
        isOpen={selectedSong !== null}
        onClose={closePopup}
      >
        {selectedSong && (
          <div className="flex flex-col">
            {/* Song details */}
            <section className="flex flex-col gap-3 pb-5 border-b border-gray-300">
              <div className="font-heading font-semibold text-xs text-gray-600 uppercase">
                SONG
              </div>

              <div className="flex flex-row gap-4 items-start">
                <img
                  src={selectedSong.song_album_cover}
                  alt={selectedSong.song_name}
                  className="w-20 h-20 object-cover shrink-0"
                />

                <div className="min-w-0">
                  <p className="text-lg font-bold">
                    {selectedSong.song_name}
                  </p>

                  <p className="text-sm text-gray-600">
                    {selectedSong.song_artist}
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    {selectedSong.song_album} · {selectedSong.song_year}
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

                  <p className="text-sm leading-5">
                    {selectedSong.prompt}
                  </p>
                </div>

                <div>
                  <p className="font-heading text-xs font-semibold text-gray-600 mb-1">
                    MESSAGE
                  </p>

                  <p className="text-sm leading-5">
                    {selectedSong.message}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </Popup>
    </div>
  );
}
