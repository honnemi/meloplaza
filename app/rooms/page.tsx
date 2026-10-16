import RoomWindow from "@/components/RoomWindow";
import { getRooms } from "@/app/actions";

export default async function RoomsPage() {
    const rooms = await getRooms();

    return (
        <div className="w-full h-screen overflow-hidden flex items-center justify-center p-6 sm:p-12">
            <RoomWindow rooms={rooms} />
        </div>
    );
}