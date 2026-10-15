"use client";

import { useEffect, useState } from "react";
import { getCurrentUserId, getUserById } from "@/app/actions";
import { useTransitionRouter } from "next-view-transitions";
import Avatar from "@/components/Avatar"; 
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  displayName: string;
  colour: string;
  faceIndex: number;
}

export default function LoggedInUser() {
  const router = useTransitionRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const userId = await getCurrentUserId();
        if (!userId) {
          setLoading(false);
          return;
        }

        const user = await getUserById(userId);
        if (user) {
          setProfile({
            id: user.id,
            displayName: user.display_name,
            colour: user.colour,
            faceIndex: user.face_index,
          });
        }
      } catch (error) {
        console.error("Failed to load saved profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      router.push("/");
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-64 bg-win border-2 border-win-border-dark rounded-md p-2 text-xs font-bold shadow-[3px_3px_0px_rgba(0,90,100,0.3)] select-none font-heading">
        Loading user...
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="w-64 bg-win border-2 border-win-border-dark rounded-md overflow-hidden shadow-[3px_3px_0px_rgba(0,90,100,0.3)] select-none">
      {/* Titlebar */}
      <div className="bg-(image:--win-titlebar) border-b-2 border-win-border-dark px-2.5 py-1 text-xs font-bold flex items-center justify-between shadow-[inset_0_1px_0px_rgba(255,255,255,0.9)]">
        <span className="truncate leading-none text-gray-800 font-heading font-bold flex flex-row gap-2 items-center">
          <i className="hn hn-user-solid"></i>
          My Profile
        </span>

        {/* Window controls wrapper */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Green button */}
          <div
            className="w-3.5 h-3.5 rounded-full border border-green-800 transition-[filter,transform] duration-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(0,100,20,0.4),0_1px_2px_rgba(0,0,0,0.25)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-[1px] active:brightness-95 cursor-pointer"
            style={{
              backgroundImage: `
                linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 25%, transparent 45%),
                linear-gradient(to bottom, #28CD41 0%, #34E050 45%, #DDFCE5 100%)
              `,
            }}
          />

          {/* Yellow button */}
          <div
            className="w-3.5 h-3.5 rounded-full border border-amber-700 transition-[filter,transform] duration-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(150,80,0,0.4),0_1px_2px_rgba(0,0,0,0.25)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-[1px] active:brightness-95 cursor-pointer"
            style={{
              backgroundImage: `
                linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 25%, transparent 45%),
                linear-gradient(to bottom, #FFBD2E 0%, #FFCC4D 45%, #FFF6D6 100%)
              `,
            }}
          />

          {/* Red button (Log out) */}
          <div
            onClick={handleLogout}
            title="Log Out"
            className="w-3.5 h-3.5 rounded-full border border-red-800 transition-[filter,transform] duration-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(140,0,20,0.4),0_1px_2px_rgba(0,0,0,0.25)] hover:-translate-y-[1px] hover:brightness-110 active:translate-y-[1px] active:brightness-95 cursor-pointer"
            style={{
              backgroundImage: `
                linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 25%, transparent 45%),
                linear-gradient(to bottom, #FF5F56 0%, #FF7B73 45%, #FFEBEA 100%)
              `,
            }}
          />
        </div>
      </div>

      {/* Main Inner Well */}
      <div
        className="p-1.5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0px, transparent 3px, rgba(255,255,255,0.35) 3px, rgba(255,255,255,0.35) 5px)",
        }}
      >
        <div className="bg-white/60 p-2 rounded-sm border-2 border-win-border shadow-[inset_1px_1px_0px_rgba(0,90,100,0.25),inset_-1px_-1px_0px_rgba(255,255,255,0.9)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Avatar Wrapper - -mb-4 prevents clipping from <Avatar>'s built-in pb-4 */}
            <div className="shrink-0 scale-75 -mb-4 -ml-2">
              <Avatar
                colour={profile.colour}
                faceIndex={profile.faceIndex}
                size="size-12"
                textSize="text-base"
              />
            </div>

            {/* Display Name */}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide leading-none mb-0.5 font-heading">
                Logged in
              </span>
              <span className="text-xs font-bold text-gray-600 truncate leading-none">
                {profile.displayName}
              </span>
            </div>
          </div>

          {/* Retro Tactile "Exit" Button */}
          <button
            onClick={handleLogout}
            className="shrink-0 px-2 py-1 text-[11px] font-bold border-2 border-win-border-dark rounded-sm bg-win-alt shadow-[1px_1px_0px_rgba(0,90,100,0.3)] hover:-translate-y-[1px] active:translate-y-[1px] cursor-pointer text-gray-800 font-heading flex flex-row gap-2 items-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #ffffff 0%, #d5f0f5 100%)",
            }}
          >
            <i className="hn hn-logout-solid"></i>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
