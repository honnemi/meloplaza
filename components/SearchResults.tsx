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
    <div className="w-full mt-4">
      {/* Align both blocks vertically in the center */}
      <div className="flex flex-col w-full gap-4 items-center justify-center">
        
        {/* Results Block */}
        <div className="w-full flex flex-col justify-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Search Results
          </h2>

          <ul className="w-full h-64 overflow-y-auto border-2 border-gray-300 rounded-sm">
            {tracks.length === 0 ? (
              <p className="p-3 text-sm text-gray-500 text-center">
                Search above to see tracks.
              </p>
            ) : (
              tracks.map((track, index) => (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => onSelectTrack(track)}
                    className={`w-full py-2 px-2 flex items-center gap-4 text-left ${
                      selectedTrack?.id === track.id
                        ? "bg-blue-100"
                        : index % 2 === 0
                        ? "bg-gray-100 hover:bg-gray-200"
                        : "bg-white hover:bg-gray-200"
                    }`}
                  >
                    {track.album?.images?.[2] && (
                      <img
                        src={track.album.images[2].url}
                        alt=""
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-black truncate">
                        {track.name}
                      </p>

                      <p className="text-xs text-gray-500 truncate">
                        {track.artists?.[0]?.name} ·{" "}
                        {track.album?.name} ·{" "}
                        {track.album?.release_date?.slice(0, 4)}
                      </p>
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
              
        {/* Player Block */}
        <div className="w-full flex flex-col items-start justify-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Preview Song
          </h2>
          <MusicPlayer selectedTrack={selectedTrack} />
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}