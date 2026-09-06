interface AvatarProps {
  colour: string; // Accepts hex, rgb, or hsl (e.g., "#3b82f6" or "rgb(59, 130, 246)")
  face: string;
}

export default function Avatar({ colour, face }: AvatarProps) {
  return (
    <div className="relative flex flex-col items-center pb-3">
      {/* Ground shadow */}
      <div className="absolute bottom-0 h-2 w-20 rounded-[50%] bg-black/20 blur-md" />

      {/* Bubble container */}
      <div
        className="relative z-10 flex size-24 items-center justify-center rounded-full text-3xl shadow-[inset_-2px_-4px_12px_rgba(255,255,255,0.6),inset_2px_4px_10px_rgba(0,0,0,0.05)] backdrop-blur-sm"
        style={{
          backgroundColor: `color-mix(in srgb, ${colour} 25%, transparent)`,
          borderColor: `color-mix(in srgb, ${colour} 40%, transparent)`,
          borderWidth: '1px',
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
        {face}
      </div>
    </div>
  );
}