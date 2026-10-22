import { Suspense } from "react";
import ProfilePageClient from "@/components/UserProfileClient"; // Move your current code to this file

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageClient />
    </Suspense>
  );
}
