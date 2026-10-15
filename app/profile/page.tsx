import { getCurrentUserId, getUserById } from "@/app/actions";
import UserProfile from "@/components/UserProfile";

export default async function ShowProfile() {

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 sm:p-12">
      <UserProfile />
    </div>
  );
}