import Plaza from "@/components/Plaza";
import Navigation from "@/components/Navigation";
import RoomActions from "@/components/RoomActions";
import { getCurrentUserId, getRoomById } from "@/app/actions";
import { notFound } from "next/navigation";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = await getRoomById(id);

  if (!room) {
    notFound();
  }

  const avatars = room.members.map((user) => ({
    id: user.id,
    displayName: user.display_name,
    colour: user.colour,
    faceIndex: user.face_index,
  }));

  const currentUserId = await getCurrentUserId();
  const isOwner = currentUserId !== null && room.created_by === currentUserId;
  const isMember = room.members.some((user) => user.id === currentUserId);

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden">
      <Plaza avatars={avatars} roomId={id} />

      <header className="absolute top-3 right-3 lg:top-5 lg:left-1/2 lg:-translate-x-1/2 lg:right-auto z-40 flex flex-col items-end lg:items-center gap-2 pointer-events-none w-auto max-w-[230px] lg:max-w-xl">
        <div className="pointer-events-auto flex flex-col items-end lg:items-center bg-white/80 backdrop-blur-md px-3 py-2 lg:px-4 lg:py-3 rounded-2xl shadow-sm border border-gray-100 w-full">
          <h1 className="text-sm lg:text-lg font-bold font-heading text-gray-900 truncate w-full text-right lg:text-center">
            {room.name}
          </h1>
          <p className="text-xs lg:text-sm text-gray-600 text-right lg:text-center mt-0.5">
            {room.members.length} / {room.capacity}
          </p>
        </div>

        <div className="pointer-events-auto flex justify-end w-full lg:w-auto">
          <RoomActions roomId={id} isMember={isMember} isOwner={isOwner} />
        </div>
      </header>

      <Navigation />
    </div>
  );
}