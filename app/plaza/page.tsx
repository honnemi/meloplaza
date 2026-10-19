import Plaza from "@/components/Plaza";
import { getUsers } from "@/lib/supabase/server";
import Navigation from "@/components/Navigation";

export default async function PlazaPage() {
  // Get users to populate the plaza
  const users = await getUsers();

  const avatars = (users ?? []).map((user) => ({
    id: user.id,
    displayName: user.display_name,
    colour: user.colour,
    faceIndex: user.face_index,
  }));

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center overflow-x-hidden">
      {/* Plaza */}
      <main className="w-full flex-1">
        <Plaza avatars={avatars} />
      </main>

      {/* Navigation bar */}
      <Navigation />
    </div>
  );
}
