"use client"

import { Link } from "next-view-transitions";
import { useEffect, useState } from "react";
import { getCurrentUserId } from "@/app/actions"

export default function Navigation() {

  const [currentUser, setCurrentUser] =
    useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      const user = await getCurrentUserId();
      setCurrentUser(user);
    };

    loadUserProfile();
  }, []);

  return (
    <div
      className="relative z-20 flex flex-row items-center justify-between
        px-8 py-4
        bg-gray-300
        border-b-2 border-gray-500
        shadow-[0_4px_6px_rgba(0,0,0,0.25),inset_0_1px_0px_rgba(255,255,255,0.9)]"
      style={{
        backgroundImage: `
            linear-gradient(
              180deg,
              #dce0e4 0%,
              #d1d5db 35%,
              #c9cdd2 50%,
              #d1d5db 65%,
              #c5c9ce 100%
            )
          `,
      }}
    >
      <span className="font-bold">meloplaza</span>

      <div className="flex flex-row items-center gap-10">
        <Link
          href={`/profile/${currentUser}`}
          className="relative flex flex-row gap-2 items-center hover:cursor-pointer"
        >
          <i className="text-xs hn hn-user-solid"></i>
          <span className="text-xs font-bold">My Recommendation</span>
        </Link>

        <Link
          href="/collection"
          className="relative flex flex-row gap-2 items-center hover:cursor-pointer"
        >
          <i className="text-xs hn hn-disc-solid"></i>
          <span className="text-xs font-bold">My Collection</span>
        </Link>

        <Link
          href="/"
          className="relative flex flex-row gap-2 items-center hover:cursor-pointer"
        >
          <i className="text-xs hn hn-logout-solid"></i>
          <span className="text-xs font-bold">Exit</span>
        </Link>
      </div>
    </div>
  );
}
