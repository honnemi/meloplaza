import Plaza from "@/components/Plaza";
import { getUsers } from "@/lib/supabase/server";
import Navigation from "@/components/Navigation"

export default async function PlazaPage() {
  const users = await getUsers();

  const avatars = users.map((user) => ({
    id: user.id,
    displayName: user.display_name,
    colour: user.colour,
    faceIndex: user.face_index,
  }));

  return (
    <>
      <Navigation />
      <Plaza avatars={avatars} />
      
    </>
  );
}
