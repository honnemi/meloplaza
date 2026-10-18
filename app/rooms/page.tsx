import RoomWindow from "@/components/RoomWindow";
import { getCurrentUserId, getRooms } from "@/app/actions";
import { redirect } from "next/navigation"; //  Import redirect

export default async function RoomsPage() {
  const rooms = await getRooms();
  const currentUser = await getCurrentUserId();

  if (!currentUser) {
    redirect("/plaza"); 
  }

  return (
    <div className="w-full h-screen overflow-hidden flex items-center justify-center p-6 sm:p-12">
      <RoomWindow rooms={rooms} currentUserId={currentUser} />
    </div>
  );
}
