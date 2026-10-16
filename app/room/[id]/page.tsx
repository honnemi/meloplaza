
import Plaza from "@/components/Plaza";
import Navigation from "@/components/Navigation";
import RoomActions from "@/components/RoomActions";
import { getRoomById } from "@/app/actions";
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

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center overflow-x-hidden">
            <div className="relative z-20 mt-5 flex flex-col text-center">
                <span className="font-heading text-sm font-bold">
                    You are now browsing:
                </span>

                <h1 className="font-heading text-4xl font-bold">
                    {room.name}
                </h1>

                <p className="mt-1 text-sm">
                    {room.members.length} / {room.capacity} members
                </p>

                <div className="mt-3">
                    <RoomActions
                        roomId={room.id}
                        isMember={room.isMember}
                    />
                </div>
            </div>

            <main className="w-full flex-1">
                <Plaza avatars={avatars} />
            </main>

            <Navigation />
        </div>
    );
}
