import Plaza from "@/components/Plaza";
import { getUsers } from "@/lib/supabase/server";
import Navigation from "@/components/Navigation";

export default async function PlazaPage() {
  // Get all users and map them to an array to pass to Plaza component
  const users = await getUsers();

  const avatars = (users ?? []).map((user) => ({
    id: user.id,
    displayName: user.display_name,
    colour: user.colour,
    faceIndex: user.face_index,
  }));

  return (
    <>
      {/* Navigation bar */}
      <Navigation />
      {/* Plaza component */}
      <Plaza avatars={avatars} />
    </>
  );
}
