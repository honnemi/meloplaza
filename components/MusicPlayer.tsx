"use client";

export default function MusicPlayer({
  selectedTrack,
  songId,
  songName,
  songArtist,
}: {
  selectedTrack?: any;
  songId?: string;
  songName?: string;
  songArtist?: string;
}) {
  const trackId = songId ?? selectedTrack?.id;

  const displayName = selectedTrack
    ? `${selectedTrack.name} — ${selectedTrack.artists?.[0]?.name}`
    : songName && songArtist
      ? `${songName} — ${songArtist}`
      : "— — — — — —";

  return (
    <div
      className="w-full min-w-0 p-3 sm:p-4 rounded-xl border-2 shadow-[3px_4px_0_rgba(0,90,100,0.3)]"
      style={{
        background:
          "linear-gradient(145deg, #f4fcfd 0%, #c9edf2 45%, #9fdbe4 100%)",
        borderColor: "#2f8a99",
      }}
    >
      {/* Disc + LCD */}
      <div className="flex items-center gap-3 mb-3 min-w-0">
        {/* CD */}
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shrink-0 relative overflow-hidden"
          style={{
            border: "2px solid #2f8a99",
            boxShadow:
              "inset 2px 2px 3px rgba(255,255,255,0.8), inset -2px -2px 3px rgba(0,90,100,0.25), 2px 2px 0 rgba(0,90,100,0.2)",
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 20deg, #e6fafc, #7ee3ea, #ffb3c4, #fff0a0, #b3f0df, #a8d4ff, #e6fafc)",
              animation: trackId ? "spin 4s linear infinite" : "none",
            }}
          >
            {/* CD rings */}
            <div
              className="absolute inset-[15%] rounded-full"
              style={{ border: "1px solid rgba(255,255,255,0.5)" }}
            />

            <div
              className="absolute inset-[30%] rounded-full"
              style={{ border: "1px solid rgba(255,255,255,0.45)" }}
            />

            {/* Spindle */}
            <div
              className="absolute rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: "14%",
                height: "14%",
                background: "#0f4a52",
                border: "1px solid #072a30",
                boxShadow: "inset 0 1px 2px rgba(255,255,255,0.3)",
              }}
            />
          </div>

          {/* CD glare */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "linear-gradient(125deg, transparent 25%, rgba(255,255,255,0.8) 42%, transparent 52%)",
            }}
          />
        </div>

        {/* LCD */}
        <div
          className="flex-1 min-w-0 px-2 sm:px-3 py-2 border-2"
          style={{
            background: "linear-gradient(180deg, #0b3138 0%, #114650 100%)",
            borderColor: "#2f8a99",
            boxShadow:
              "inset 2px 2px 5px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.15)",
          }}
        >
          <p
            className="text-[8px] sm:text-[9px] tracking-[0.18em] uppercase font-bold"
            style={{
              color: "#7ee3ea",
              textShadow: "0 0 4px rgba(0,195,208,0.6)",
            }}
          >
            {trackId ? "♪ NOW PLAYING" : "♪ NO DISC"}
          </p>

          <p
            className="text-[10px] sm:text-xs truncate"
            style={{
              color: "#d5f8fb",
              textShadow: "0 0 3px rgba(126,227,234,0.4)",
            }}
          >
            {displayName}
          </p>
        </div>
      </div>

      {/* Screen */}
      <div
        className="rounded-md p-1.5 sm:p-2 border-2 w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #d5f0f5 0%, #f4fcfd 50%, #bfe6ec 100%)",
          borderColor: "#5fb4c2",
          boxShadow:
            "inset 2px 2px 4px rgba(0,90,100,0.25), inset -1px -1px 2px rgba(255,255,255,0.8)",
        }}
      >
        {trackId ? (
          <iframe
            key={trackId}
            src={`https://open.spotify.com/embed/track/${trackId}`}
            width="100%"
            height="152"
            allow="autoplay; encrypted-media"
            loading="lazy"
            className="rounded block w-full"
          />
        ) : (
          <div
            className="h-38 flex items-center justify-center text-xs text-center px-4"
            style={{ color: "#2f6f7a" }}
          >
            [ SELECT A TRACK TO LOAD DISC ]
          </div>
        )}
      </div>
    </div>
  );
}