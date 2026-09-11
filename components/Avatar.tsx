import { AVATAR_FACES } from "@/app/avatar-customisation";

interface AvatarProps {
  colour: string;
  faceIndex: number;
  size?: string;
  textSize?: string;
}

export default function Avatar({
  colour,
  faceIndex,
  size = "size-24",
  textSize = "text-3xl",
}: AvatarProps) {
  return (
    <div className="relative flex flex-col items-center pb-4">
      {/* Bubble container */}
      <div
        className={`relative z-10 flex ${size} ${textSize} items-center justify-center rounded-full shadow-[inset_-2px_-4px_12px_rgba(255,255,255,0.6),inset_2px_4px_10px_rgba(0,0,0,0.05)] backdrop-blur-sm`}
        style={{
          backgroundColor: `color-mix(in srgb, ${colour} 25%, transparent)`,
          borderColor: `color-mix(in srgb, ${colour} 40%, transparent)`,
          borderWidth: "1px",
          backgroundImage: `
            radial-gradient(
              circle at 35% 20%,
              rgba(255, 255, 255, 0.7) 0%,
              rgba(255, 255, 255, 0.15) 25%,
              transparent 50%
            ),
            radial-gradient(
              circle at 65% 85%,
              color-mix(in srgb, ${colour} 60%, transparent) 0%,
              transparent 60%
            )
          `,
        }}
      >
        {AVATAR_FACES[faceIndex]}
      </div>

      {/* Ground shadow */}
      <div className="absolute bottom-1 z-0 h-2.5 w-16 rounded-[50%] bg-black/40 blur-[3px]" />
    </div>
  );
}