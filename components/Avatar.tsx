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
      {/* Ground shadow */}
      <div
        className="absolute z-0 rounded-[50%] bg-black/20"
        style={{
          width: "83.33%",
          height: "20.83%",
          bottom: "4.17%",
        }}
      />

      {/* Bubble */}
      <div
        className={`relative z-10 flex ${size} ${textSize} items-center justify-center overflow-hidden rounded-full`}
        style={{
          backgroundColor: colour,
        }}
      >
        {/* Angled highlight */}
        <div
          className="pointer-events-none absolute rounded-[50%] bg-white/50 blur-[1px]"
          style={{
            width: "25%",
            height: "12.5%",
            left: "14.6%",
            top: "14.6%",
            transform: "rotate(-25deg)",
          }}
        />

        {/* Face */}
        <span className="relative z-10">
          {AVATAR_FACES[faceIndex]}
        </span>
      </div>
    </div>
  );
}