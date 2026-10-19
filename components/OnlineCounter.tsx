"use client";

interface OnlineCounterProps {
  count: number;
}

// Display number of users currently online and viewing the same plaza
export default function OnlineCounter({ count }: OnlineCounterProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-linear-to-b from-[#4FE3A0] to-[#ffffff] border-2 border-[#2BB37A] rounded-full" />

      <div className="text-black font-heading font-bold text-lg">
        Currently browsing: {count} 
      </div>
    </div>
  );
}