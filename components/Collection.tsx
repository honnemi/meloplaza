"use client";

import Window from "@/components/Window";
import Button, { ActionButton, SecondaryButton } from "@/components/Button";
import CD from "@/components/CD";
import Avatar from "@/components/Avatar";
import Popup from "@/components/PopupWindow";
import { useRouter, useSearchParams } from "next/navigation";

import { useState } from "react";
import {
  getUserById,
  deleteRecommendation,
  deleteCollectionItem,
} from "@/app/actions";

// A saved recommendation made by another user
export interface CollectionItem {
  id: string;
  recommendation: string;
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
  } | null;
}

// A recommendation made by the current user
export interface MyRecommendationItem {
  id: string;
  song_name: string;
  song_artist: string;
  song_album: string;
  song_album_cover: string;
  song_year: string;
  prompt: string;
  message: string;
  collection_count: number; // how many people have saved it
  created_at: string;
  is_current: boolean;
}

interface CollectionProps {
  collection: CollectionItem[];
  myRecommendations: MyRecommendationItem[];
}

type Tab = "mine" | "saved";

type Selected =
  | { kind: "saved"; item: CollectionItem }
  | { kind: "mine"; item: MyRecommendationItem };

// A single album cover + CD + title/artist tile
function SongTile({
  cover,
  name,
  artist,
  badge,
  onClick,
}: {
  cover: string;
  name: string;
  artist: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 items-center text-center min-w-0">
      <div
        className="relative w-full max-w-40 aspect-square group cursor-pointer"
        onClick={onClick}
      >
        {/* CD */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 z-0 transition-all duration-200 group-hover:right-[-20px]">
          <CD />
        </div>

        {/* Album cover */}
        <img
          src={cover}
          alt={name}
          className="relative z-10 w-full h-full object-cover shadow-[0_4px_6px_rgba(0,90,100,0.3),inset_0_1px_0px_rgba(255,255,255,0.9)]"
        />

        {badge && (
          <span className="absolute top-1.5 left-1.5 z-20 px-2 py-0.5 text-[10px] font-bold font-heading uppercase border border-[#3f9a6a] bg-[#d6fbe4] text-[#1f6b45] rounded-full shadow-sm">
            {badge}
          </span>
        )}
      </div>

      <div className="min-w-0 w-full max-w-40">
        <p className="text-sm font-bold truncate">{name}</p>
        <p className="text-sm text-gray-600 truncate">{artist}</p>
      </div>
    </div>
  );
}

export default function Collection({
  collection,
  myRecommendations,
}: CollectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>("mine");
  const [selected, setSelected] = useState<Selected | null>(null);
  const [selectedUser, setSelectedUser] = useState<
    CollectionItem["original_creator"] | null
  >(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Deleting recommendations
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [removedCollectionIds, setRemovedCollectionIds] = useState<Set<string>>(
    new Set(),
  );

  const visibleMine = myRecommendations.filter((r) => !deletedIds.has(r.id));
  const visibleCollection = collection.filter(
    (c) => !removedCollectionIds.has(c.id),
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const fromRoom = searchParams.get("fromRoom");

  const backHref = fromRoom
    ? `/room/${encodeURIComponent(fromRoom)}`
    : "/plaza";

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

  const switchTab = (tab: Tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    playClickSound();
  };

  // Open details popup for a saved song and fetch its creator if needed
  const openSavedPopup = async (item: CollectionItem) => {
    setSelected({ kind: "saved", item });
    setSelectedUser(null);
    setConfirmingDelete(false);
    setDeleteError(null);
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

  const openMinePopup = (item: MyRecommendationItem) => {
    setSelected({ kind: "mine", item });
    setConfirmingDelete(false);
    setDeleteError(null);
    playClickSound();
  };

  // Close popup and reset selected state
  const closePopup = () => {
    setSelected(null);
    setSelectedUser(null);
    setConfirmingDelete(false);
    setDeleteError(null);
    playClickSound();
  };

  const handleDelete = async () => {
    if (!selected || deleting) return;

    const kind = selected.kind;
    const id = selected.item.id;

    setDeleting(true);
    setDeleteError(null);
    playClickSound();

    const res =
      kind === "mine"
        ? await deleteRecommendation(id)
        : await deleteCollectionItem(id);

    setDeleting(false);

    if (!res.success) {
      setDeleteError(res.error);
      return;
    }

    if (kind === "mine") {
      setDeletedIds((prev) => new Set(prev).add(id));
    } else {
      setRemovedCollectionIds((prev) => new Set(prev).add(id));
    }
    setConfirmingDelete(false);
    setSelected(null);
    router.refresh();
  };

  // Tabs for sections
  const tabClasses = (tab: Tab) =>
    `flex-1 min-w-0 flex items-center justify-center gap-1.5 overflow-hidden rounded-sm border-2 px-2 sm:px-3 py-2.5 font-heading text-xs font-bold transition-colors sm:text-sm cursor-pointer ${
      activeTab === tab
        ? "border-[#397b8b] bg-gradient-to-b from-white to-[#bceef5] text-[#174e65] shadow-[2px_2px_0px_rgba(0,90,100,0.25)]"
        : "border-[#8bbfc9] bg-white/50 text-[#4a7a89] hover:bg-[#d5f0f5] active:bg-[#d5f0f5]"
    }`;

  const gridClass =
    "grid grid-cols-[repeat(auto-fit,minmax(min(140px,100%),1fr))] gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10 w-full max-w-190 mx-auto p-1 sm:p-4";

  const emptyMessage =
    activeTab === "mine"
      ? "You haven't made a recommendation yet."
      : "You haven't saved any recommendations yet.";

  const isEmpty =
    activeTab === "mine"
      ? visibleMine.length === 0
      : visibleCollection.length === 0;

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 sm:p-12">
      <Window
        title="My Collection"
        icon={<i className="hn hn-folder-solid"></i>}
        footer={
          <div className="flex justify-between w-full">
            <Button label="Back" href={backHref} />
            <SecondaryButton
              label="Print"
              href={
                fromRoom
                  ? `/collection/print?fromRoom=${encodeURIComponent(fromRoom)}`
                  : "/collection/print"
              }
              icon={<i className="hn hn-print-solid"></i>}
            />
          </div>
        }
      >
        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Collection tabs"
          className="flex gap-2 sm:gap-3 w-full max-w-190 mx-auto px-1 sm:px-4 pt-2 pb-3"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "mine"}
            onClick={() => switchTab("mine")}
            className={tabClasses("mine")}
          >
            <span className="truncate md:hidden">Mine</span>
            <span className="hidden truncate md:block">My Recommendations</span>
            <span className="shrink-0 font-normal opacity-70">
              ({visibleMine.length})
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "saved"}
            onClick={() => switchTab("saved")}
            className={tabClasses("saved")}
          >
            <span className="truncate md:hidden">Saved</span>
            <span className="hidden truncate md:block">
              Saved Recommendations
            </span>
            <span className="shrink-0 font-normal opacity-70">
              ({visibleCollection.length})
            </span>
          </button>
        </div>

        {/* Empty message, otherwise grid of songs for the active tab */}
        {isEmpty ? (
          <div className="h-full min-h-40 flex items-center justify-center">
            <p className="text-center text-gray-400">{emptyMessage}</p>
          </div>
        ) : activeTab === "mine" ? (
          <div role="tabpanel" className={gridClass}>
            {visibleMine.map((item) => (
              <SongTile
                key={item.id}
                cover={item.song_album_cover}
                name={item.song_name}
                artist={item.song_artist}
                badge={item.is_current ? "Current" : undefined}
                onClick={() => openMinePopup(item)}
              />
            ))}
          </div>
        ) : (
          <div role="tabpanel" className={gridClass}>
            {visibleCollection.map((item) => (
              <SongTile
                key={item.id}
                cover={item.song_album_cover}
                name={item.song_name}
                artist={item.song_artist}
                onClick={() => openSavedPopup(item)}
              />
            ))}
          </div>
        )}
      </Window>

      {/* Song details popup */}
      <Popup title="Details" isOpen={selected !== null} onClose={closePopup}>
        {selected && (
          <div className="flex flex-col">
            {/* Song details */}
            <section className="flex flex-col gap-3 pb-5 border-b border-gray-300">
              <div className="font-heading font-semibold text-xs text-gray-600 uppercase">
                SONG
              </div>

              <div className="flex flex-row gap-4 items-start">
                <img
                  src={selected.item.song_album_cover}
                  alt={selected.item.song_name}
                  className="w-20 h-20 object-cover shrink-0 rounded"
                />

                <div className="min-w-0">
                  <p className="text-lg font-bold wrap-break-word">
                    {selected.item.song_name}
                  </p>

                  <p className="text-sm text-gray-600">
                    {selected.item.song_artist}
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    {selected.item.song_album} · {selected.item.song_year}
                  </p>
                </div>
              </div>
            </section>

            {/* Recommended by (saved) / saved by (mine) */}
            <section className="flex flex-col gap-3 py-5 border-b border-gray-300">
              {selected.kind === "mine" ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-sm text-gray-700">
                    <i className="hn hn-heart-solid text-pink-500 text-xs"></i>
                    <span className="font-bold">
                      Added by {selected.item.collection_count}{" "}
                      {selected.item.collection_count === 1
                        ? "person"
                        : "people"}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600">
                    {selected.item.is_current ? "Current · " : ""}
                    Shared{" "}
                    {new Date(selected.item.created_at).toLocaleDateString(
                      "en-AU",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </p>
                </div>
              ) : loadingUser ? (
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

                  <p className="text-sm leading-5 wrap-break-word">
                    {selected.item.prompt}
                  </p>
                </div>

                <div>
                  <p className="font-heading text-xs font-semibold text-gray-600 mb-1">
                    MESSAGE
                  </p>

                  <p className="text-sm leading-5 whitespace-pre-wrap wrap-break-word">
                    {selected.item.message}
                  </p>
                </div>
              </div>
            </section>

            {/* Delete: saved items always; your recommendations as long as you keep at least one */}
            {(selected.kind === "saved" || visibleMine.length > 1) && (
              <section className="flex flex-col gap-3 pt-5 mt-5 border-t border-gray-300">
                {deleteError && (
                  <div className="p-2.5 bg-red-100 border border-red-400 text-red-700 text-xs rounded font-medium">
                    {deleteError}
                  </div>
                )}

                {confirmingDelete ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-700">
                      {selected.kind === "saved"
                        ? "Remove this song from your collection? This can't be undone."
                        : "Delete this recommendation? This can't be undone."}
                      {selected.kind === "mine" &&
                        selected.item.is_current &&
                        " Your previous recommendation will become your current one."}
                    </p>

                    <div className="flex flex-wrap justify-end gap-2">
                      <ActionButton
                        label="Keep"
                        disabled={deleting}
                        onClick={() => {
                          setConfirmingDelete(false);
                          setDeleteError(null);
                          playClickSound();
                        }}
                      >
                      </ActionButton>

                      <ActionButton
                        label={deleting ? "Deleting..." : "Delete"}
                        icon="hn hn-trash-alt-solid text-base"
                        disabled={deleting}
                        onClick={handleDelete}
                        className="text-[#FF2D55]"
                      >
                      </ActionButton>
                    </div>
                  </div>
                ) : (
                  <ActionButton
                    label="Delete"
                    icon="hn hn-trash-alt-solid text-base"
                    onClick={() => {
                      setConfirmingDelete(true);
                      playClickSound();
                    }}
                    className="self-end text-[#FF2D55]"
                  >
                  </ActionButton>
                )}
              </section>
            )}
          </div>
        )}
      </Popup>
    </div>
  );
}
