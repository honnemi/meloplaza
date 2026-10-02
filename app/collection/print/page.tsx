import {
  getUserCollection,
  getUserById,
  getCurrentUserId,
} from "@/app/actions";
import PrintButton from "@/components/PrintButton";
import Button from "@/components/Button";

function formatDuration(durationMs: number) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default async function PrintCollection() {
  const collection = (await getUserCollection()) || [];

  // Get the current logged-in user
  const currentUserId = await getCurrentUserId();
  const currentUser = currentUserId ? await getUserById(currentUserId) : null;

  const now = new Date();
  const currentDate = now.toLocaleDateString();
  const currentHour = now.getHours();
  const currentMinutes = String(now.getMinutes()).padStart(2, "0");

  // Get the user who created each recommendation + recommendation itself
  const collectionWithUsers = await Promise.all(
    collection.map(async (item) => {
      const song = item.Recommendations;

      if (!song) {
        return { ...item, user: null, Recommendations: null };
      }

      const user = await getUserById(song.created_by);

      return {
        ...item,
        Recommendations: song,
        user,
      };
    }),
  );

  return (
    <div className="print-page min-h-screen flex items-center justify-center">
      <div className="receipt-container font-mono bg-white text-center flex flex-col gap-4 w-full max-w-sm mx-auto p-4 border shadow-sm">
        <div className="font-bold text-xl">meloplaza 𝄢</div>

        <hr />

        <div className="flex flex-row">
          <div className="flex flex-col flex-1 justify-start text-left text-sm">
            <p>Client: @{currentUser?.display_name}</p>
            <p>{currentDate}</p>
          </div>

          <div className="flex flex-col flex-1 justify-end text-right text-sm">
            <p>
              {currentHour}:{currentMinutes}
            </p>
          </div>
        </div>

        <hr />

        {/* Column headings */}
        <div className="flex flex-row w-full text-xs font-bold">
          <div className="flex-1 text-left">ITEM</div>

          <div className="w-[15%] text-right">QTY</div>

          <div className="w-[25%] text-right">DURATION</div>
        </div>

        <hr />

        <ul className="flex flex-col gap-3 list-none p-0 m-0 w-full">
          {collectionWithUsers.map((item) => {
            const song = item.Recommendations;

            if (!song) return null;

            return (
              <li
                key={song.id}
                className="flex flex-row justify-between items-start w-full"
              >
                {/* Song information */}
                <div className="flex flex-col flex-1 justify-start text-left text-sm">
                  <p className="font-medium">{song.song_name}</p>

                  <p className="text-xs">{song.song_artist}</p>

                  <p className="text-xs">
                    Recommended by @{item.user?.display_name}
                  </p>

                  <p className="text-xs">"{song.message}"</p>
                </div>

                {/* Quantity */}
                <div className="w-[15%] text-right text-sm">
                  <p>1</p>
                </div>

                {/* Duration */}
                <div className="w-[25%] text-right text-sm">
                  <p>{formatDuration(song.song_duration)}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <hr />

        {/* Thank you + logo */}
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <div className="font-bold text-xl">THANKS FOR VISITING!</div>
          <img className="w-50 h-50" src="/assets/qr-code.png" alt="QR Code to meloplaza" />
          <p className="text-sm text-center w-50">
            Scan the QR code above to visit meloplaza again!
          </p>
        </div>
      </div>

      {/* Print action */}
      <div className="fixed top-6 right-6 z-50">
        <PrintButton />
      </div>

      {/* Back button */}
      <div className="fixed top-6 left-6 z-50">
        <Button label="Back" href="/collection" />
      </div>
    </div>
  );
}
