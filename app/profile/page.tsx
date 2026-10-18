import ProfilePage from "@/components/UserProfile";

export default async function ShowProfile() {

  return (
    <div className="w-full h-screen overflow-hidden flex items-center justify-center p-6 sm:p-12">
      <ProfilePage />
    </div>
  );
}