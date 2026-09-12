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
      className="w-full min-w-0 p-3 sm:p-4 rounded-xl border-2 shadow-[3px_4px_0_rgba(31,46,51,0.25)]"
      style={{
        background:
          "linear-gradient(145deg, #E9EEF2 0%, #CBD3DA 45%, #AEB8C1 100%)",
        borderColor: "#64727C",
      }}
    >
      {/* Plastic shine */}
      <div
        className="pointer-events-none absolute"
        style={{
          display: "none",
        }}
      />

      {/* Disc + LCD */}
      <div className="flex items-center gap-3 mb-3 min-w-0">
        {/* CD */}
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shrink-0 relative overflow-hidden"
          style={{
            border: "2px solid #7C8992",
            boxShadow:
              "inset 2px 2px 3px rgba(255,255,255,0.8), inset -2px -2px 3px rgba(0,0,0,0.2), 2px 2px 0 rgba(0,0,0,0.15)",
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 20deg, #dce9ef, #a8c8d8, #e7bfd2, #f3dfad, #b9dfd0, #b8c8e8, #dce9ef)",
              animation: trackId
                ? "spin 4s linear infinite"
                : "none",
            }}
          >
            {/* CD rings */}
            <div
              className="absolute inset-[15%] rounded-full"
              style={{
                border: "1px solid rgba(255,255,255,0.45)",
              }}
            />

            <div
              className="absolute inset-[30%] rounded-full"
              style={{
                border: "1px solid rgba(255,255,255,0.4)",
              }}
            />

            {/* Spindle */}
            <div
              className="absolute rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: "14%",
                height: "14%",
                background: "#26353A",
                border: "1px solid #10191C",
                boxShadow:
                  "inset 0 1px 2px rgba(255,255,255,0.25)",
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
            background:
              "linear-gradient(180deg, #172B32 0%, #223B43 100%)",
            borderColor: "#56656B",
            boxShadow:
              "inset 2px 2px 5px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.12)",
          }}
        >
          <p
            className="text-[8px] sm:text-[9px] tracking-[0.18em] uppercase font-bold"
            style={{
              color: "#74D7E8",
              textShadow: "0 0 4px rgba(116,215,232,0.5)",
            }}
          >
            {trackId ? "♪ NOW PLAYING" : "♪ NO DISC"}
          </p>

          <p
            className="text-[10px] sm:text-xs font-mono truncate"
            style={{
              color: "#C8F3F5",
              textShadow: "0 0 3px rgba(200,243,245,0.35)",
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
            "linear-gradient(145deg, #D9E0E4 0%, #EEF2F4 50%, #C5CED3 100%)",
          borderColor: "#7D8991",
          boxShadow:
            "inset 2px 2px 4px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.8)",
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
            className="h-38 flex items-center justify-center text-xs text-center px-4 font-mono"
            style={{
              color: "#52636A",
            }}
          >
            [ SELECT A TRACK TO LOAD DISC ]
          </div>
        )}
      </div>
    </div>
  );
}