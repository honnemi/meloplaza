"use client"

export default function MusicPlayer({ selectedTrack }: { selectedTrack: any }) {
    return (
      <div
        className="flex-1 min-w-0 rounded-2xl p-4 border shadow-lg"
        style={{
          background:
            "linear-gradient(180deg, #E5E7EB 0%, #D1D5DB 50%, #BFC5CC 100%)",
          borderColor: "#64748B",
        }}
      >
        {/* Disc + LCD */}
        <div className="flex items-center gap-3 mb-3">
          {/* CD */}
        <div
          className="w-14 h-14 rounded-full shrink-0 relative overflow-hidden shadow-md"
          style={{ border: "1px solid #94A3B8" }}
        >
          {/* rotating disc surface — single gradient, no blend modes */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, #d9e2ea, #f2c6d8, #f7e2b8, #c9e8d6, #c9d3f2, #d9e2ea)",
              animation: selectedTrack ? "spin 4s linear infinite" : "none",
            }}
          >
            {/* spindle hole */}
            <div
              className="absolute rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: "14%",
                height: "14%",
                background: "#1F2E33",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.4)",
              }}
            />
          </div>

          {/* fixed glare — stays still while the disc spins underneath */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.8) 48%, transparent 60%)",
            }}
          />
        </div>

          {/* LCD readout */}
          <div
            className="flex-1 min-w-0 rounded-md px-3 py-2 border"
            style={{
              background: "#1E293B",
              borderColor: "#475569",
              boxShadow:
                "inset 0 0 8px rgba(0,0,0,0.35)",
            }}
          >
            <p
              className="text-[9px] tracking-widest uppercase font-semibold"
              style={{ color: "#60A5FA" }}
            >
              {selectedTrack
                ? "You selected"
                : "No disc"}
            </p>

            <p
              className="text-xs font-mono truncate"
              style={{ color: "#DBEAFE" }}
            >
              {selectedTrack
                ? `${selectedTrack.name} — ${selectedTrack.artists?.[0]?.name}`
                : "— — — — — —"}
            </p>
          </div>
        </div>

        {/* Screen */}
        <div
          className="rounded-lg p-2 shadow-[inset_0_4px_12px_rgba(0,0,0,0.25)] border"
          style={{
            background:
              "linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)",
            borderColor: "#94A3B8",
          }}
        >
          {selectedTrack ? (
            <iframe
              key={selectedTrack.id}
              src={`https://open.spotify.com/embed/track/${selectedTrack.id}`}
              width="100%"
              height="152"
              allow="autoplay; encrypted-media"
              loading="lazy"
              className="rounded shadow-sm"
            />
          ) : (
            <div
              className="h-38 flex items-center justify-center text-xs"
              style={{ color: "#475569" }}
            >
              Select a track to load the disc
            </div>
          )}
        </div>
      </div>
    )
}
