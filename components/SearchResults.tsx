"use client";

import MusicPlayer from "@/components/MusicPlayer";

interface SearchResultsProps {
  tracks: any[];
  selectedTrack: any;
  onSelectTrack: (track: any) => void;
}

export default function SearchResults({
  tracks,
  selectedTrack,
  onSelectTrack,
}: SearchResultsProps) {
  return (
    <div className="w-full mt-4 flex flex-col gap-4 items-center justify-center">
      {/* Results */}
      <div className="w-full flex flex-col justify-center">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Search Results
        </h2>

        <ul className="w-full h-64 overflow-y-auto border-2 border-t-win-border-dark border-l-win-border-dark border-b-win-border-alt border-r-win-border-alt rounded-sm bg-white">
          {tracks.length === 0 ? (
            <li className="p-3 text-sm italic text-gray-600 text-center">
              Search above to see tracks.
            </li>
          ) : (
            tracks.map((track, index) => {
              const isSelected = selectedTrack?.id === track.id;

              return (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => onSelectTrack(track)}
                    aria-pressed={isSelected}
                    className={`w-full py-2 px-2 flex items-center gap-4 text-left text-gray-900 cursor-pointer transition-colors duration-100
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0097a7] ${
                        isSelected
                          ? "bg-[#7ee3ea] text-gray-950 shadow-[inset_3px_0_0_#0097a7,inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(0,90,100,0.25)]"
                          : `${index % 2 === 0 ? "bg-win" : "bg-white"} hover:bg-[#c9edf2] active:bg-[#b3e6ee]`
                      }`}
                  >
                    {track.album?.images?.[2] && (
                      <img
                        src={track.album.images[2].url}
                        alt=""
                        className="w-10 h-10 rounded object-cover border border-win-border-alt shrink-0"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate">{track.name}</p>

                      <p className="text-xs text-gray-600 truncate">
                        {track.artists?.[0]?.name} · {track.album?.name} ·{" "}
                        {track.album?.release_date?.slice(0, 4)}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Player, only after a song is selected */}
      {selectedTrack && (
        <div className="w-full flex flex-col items-start justify-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Selected Song
          </h2>

          <MusicPlayer selectedTrack={selectedTrack} />
        </div>
      )}
    </div>
  );
}