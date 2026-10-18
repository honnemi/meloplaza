"use client";

import { FormEvent, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import Window from "@/components/Window";
import RoomCard from "@/components/RoomCard";
import Button from "@/components/Button";
import Popup from "@/components/PopupWindow";
import { createRoom, deleteRoom } from "@/app/actions";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

interface Room {
  id: string;
  createdAt: string;
  name: string;
  description: string;
  capacity: number;
  memberCount: number;
  isMember: boolean;
  created_by: string | null;
}

interface RoomWindowProps {
  rooms?: Room[];
  currentUserId: string;
}

type RoomTab = "joined" | "discover";

export default function RoomWindow({
  rooms = [],
  currentUserId,
}: RoomWindowProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("10");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<RoomTab>("joined");

  const router = useTransitionRouter();

  const searchParams = useSearchParams();
  const fromRoom = searchParams.get("fromRoom");

  const backHref = fromRoom
    ? `/room/${encodeURIComponent(fromRoom)}`
    : "/plaza";

  // Rooms being created/deleted and people joining/leaving update the list live
  useRealtimeRefresh("rooms-list", [
    { table: "Rooms" },
    { table: "RoomMembers" },
  ]);

  // Owned rooms first, then rooms you've only joined (original order kept within each group)
  const joinedRooms = rooms
    .filter((room) => room.isMember || room.created_by === currentUserId)
    .sort((a, b) => {
      const aOwned = a.created_by === currentUserId ? 0 : 1;
      const bOwned = b.created_by === currentUserId ? 0 : 1;
      return aOwned - bOwned;
    });

  const availableRooms = rooms.filter(
    (room) => !room.isMember && room.created_by !== currentUserId,
  );

  const tabContent: Record<
    RoomTab,
    { label: string; subtitle: string; emptyText: string; list: Room[] }
  > = {
    joined: {
      label: "Joined",
      subtitle: "Rooms you belong to, including rooms you own.",
      emptyText: "You haven't joined any rooms yet.",
      list: joinedRooms,
    },
    discover: {
      label: "Discover",
      subtitle: "Explore rooms you haven't joined yet.",
      emptyText: "No other rooms available.",
      list: availableRooms,
    },
  };

  const current = tabContent[activeTab];

  function playClickSound() {
    const clickAudio = new Audio("/assets/click.mp3");
    clickAudio.volume = 0.2;
    clickAudio.play().catch(() => {});
  }

  function handleJoin(roomId: string) {
    playClickSound();
    router.push(`/room/${roomId}`);
  }

  function resetForm() {
    setName("");
    setDescription("");
    setCapacity("10");
    setMessage("");
  }

  function closeAddModal() {
    if (isPending) return;

    setIsAddModalOpen(false);
    resetForm();
    playClickSound();
  }

  function selectTab(tab: RoomTab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    playClickSound();
  }

  async function handleCreateRoom(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      try {
        const result = await createRoom(name, description, Number(capacity));

        if (!result.success) {
          setMessage(result.error ?? "Could not create the room.");
          return;
        }

        setIsAddModalOpen(false);
        resetForm();
        playClickSound();
        router.refresh();
      } catch (error) {
        console.error("Create room failed:", error);
        setMessage("Something went wrong while creating the room.");
      }
    });
  }

  function handleDeleteRoom(room: Room) {
    if (room.created_by !== currentUserId) {
      setMessage("You can only delete rooms you created.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete "${room.name}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setMessage("");

    startTransition(async () => {
      try {
        const result = await deleteRoom(room.id);

        if (!result.success) {
          setMessage(result.error ?? "Could not delete the room.");
          return;
        }

        setMessage("");
        playClickSound();
        router.refresh();
      } catch (error) {
        console.error("Delete room failed:", error);
        setMessage(
          "Something went wrong while deleting the room. Check the console for details.",
        );
      }
    });
  }

  const renderRoom = (room: Room) => {
    const isOwner = room.created_by === currentUserId;

    return (
      <RoomCard
        key={room.id}
        id={room.id}
        name={room.name}
        description={room.description}
        capacity={room.capacity}
        memberCount={room.memberCount}
        isMember={room.isMember}
        isPending={isPending}
        created_by={room.created_by}
        tag={isOwner ? "OWNER" : null}
        onJoin={() => handleJoin(room.id)}
        onDelete={isOwner ? () => handleDeleteRoom(room) : undefined}
      />
    );
  };

  const tabClasses = (tab: RoomTab) =>
    `flex min-h-10 items-center justify-center gap-1.5 rounded-sm border-2 px-2 py-2 font-heading text-xs font-bold transition-colors sm:text-sm cursor-pointer ${
      activeTab === tab
        ? "border-[#397b8b] bg-gradient-to-b from-white to-[#bceef5] text-[#174e65] shadow-[2px_2px_0px_rgba(0,90,100,0.25)]"
        : "border-[#8bbfc9] bg-white/50 text-[#4a7a89] hover:bg-[#d5f0f5] active:bg-[#d5f0f5]"
    }`;

  return (
    <Window
      title="Rooms"
      icon={<i className="hn hn-users-solid" />}
      footer={
        <div className="flex w-full justify-between">
          <Button label="Back" href={backHref} />
        </div>
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 p-3 sm:gap-3 sm:p-4">
          {message ? (
            <p
              role="alert"
              className="order-2 w-full min-w-0 text-sm text-[#a3326f] sm:order-none sm:w-auto sm:flex-1"
            >
              {message}
            </p>
          ) : (
            <span className="hidden sm:block" />
          )}

          <button
            type="button"
            onClick={() => {
              setMessage("");
              setIsAddModalOpen(true);
              playClickSound();
            }}
            disabled={isPending}
            className="flex min-h-10 w-full shrink-0 flex-row items-center justify-center gap-2 rounded-sm border-2 border-win-border-dark bg-win-alt px-3 py-2 text-sm font-bold font-heading text-gray-800 shadow-[3px_3px_0px_rgba(0,90,100,0.3)] transition-transform hover:-translate-y-[1px] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-4 sm:py-3 cursor-pointer"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
            }}
          >
            <i className="hn hn-plus-solid" />
            Add New Room
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-2.5 pb-3 sm:px-4 sm:pb-4">
          {rooms.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No rooms found. Create your first room!
            </p>
          ) : (
            <>
              {/* Tabs */}
              <div
                role="tablist"
                aria-label="Room lists"
                className="mb-3 grid shrink-0 grid-cols-2 gap-2 sm:max-w-md"
              >
                {(Object.keys(tabContent) as RoomTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => selectTab(tab)}
                    className={tabClasses(tab)}
                  >
                    <span className="truncate">{tabContent[tab].label}</span>
                    <span className="shrink-0 font-normal opacity-70">
                      ({tabContent[tab].list.length})
                    </span>
                  </button>
                ))}
              </div>

              {/* Active tab */}
              <section
                role="tabpanel"
                className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm border-2 border-t-win-border-dark border-l-win-border-dark border-b-win-border-alt border-r-win-border-alt bg-white/40"
              >
                <p className="shrink-0 border-b-2 border-[#8bbfc9] bg-gradient-to-r from-[#b8f2fa] to-[#e8fdff] px-3 py-2 text-xs text-[#4a7a89] sm:text-sm">
                  {current.subtitle}
                </p>

                {/* Scrolling list: cards flow into as many columns as fit */}
                <div className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-20 pt-3 sm:px-3 sm:pt-4">
                  {current.list.length === 0 ? (
                    <p className="py-3 text-sm text-gray-500">
                      {current.emptyText}
                    </p>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(18rem,100%),1fr))] items-start gap-3 sm:gap-4">
                      {current.list.map(renderRoom)}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <Popup
        title="Add New Room"
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
      >
        <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Create a room for people to join and share similar music with.
          </p>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="room-name"
              className="font-heading text-sm font-semibold text-gray-600"
            >
              ROOM NAME
            </label>
            <input
              id="room-name"
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="text-input"
              placeholder="Room name"
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="room-description"
              className="font-heading text-sm font-semibold text-gray-600"
            >
              DESCRIPTION
            </label>
            <textarea
              id="room-description"
              required
              maxLength={500}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="text-input"
              placeholder="Describe your room"
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="room-capacity"
              className="font-heading text-sm font-semibold text-gray-600"
            >
              CAPACITY
            </label>
            <input
              id="room-capacity"
              type="number"
              inputMode="numeric"
              required
              min={1}
              max={50}
              step={1}
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              className="text-input"
              placeholder="10"
              disabled={isPending}
            />
          </div>

          {message && (
            <p role="alert" className="text-sm text-[#a3326f]">
              {message}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="min-h-10 w-full rounded-sm border-2 border-win-border-dark bg-win-alt px-4 py-3 text-sm font-bold font-heading text-gray-800 shadow-[3px_3px_0px_rgba(0,90,100,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
              }}
            >
              {isPending ? "Please wait..." : "Create Room"}
            </button>
          </div>
        </form>
      </Popup>
    </Window>
  );
}
