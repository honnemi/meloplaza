import {
  getUserCollection,
  getUserById,
  getCurrentUserId,
} from "@/app/actions";
import PrintButton from "@/components/PrintButton";
import Button from "@/components/Button";

// Only the most recent saved items go on the receipt
const PRINT_LIMIT = 5;

// Format duration from ms to mm:ss (or fallback if duration isn't stored)
function formatDuration(durationMs?: number) {
  if (!durationMs) return "3:30"; // Default fallback if song_duration isn't in snapshot
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default async function PrintCollection({
  searchParams,
}: {
  searchParams: Promise<{ fromRoom?: string }>;
}) {
  const { fromRoom } = await searchParams;

  // Keep the room so Back on the collection page can still return to it
  const backHref = fromRoom
    ? `/collection?fromRoom=${encodeURIComponent(fromRoom)}`
    : "/collection";

  const currentUserId = await getCurrentUserId();

  if (!currentUserId) {
    return null;
  }

  // getUserCollection returns newest first, so the first 5 are the latest
  const collection = ((await getUserCollection(currentUserId)) || []).slice(
    0,
    PRINT_LIMIT,
  );
  const currentUser = await getUserById(currentUserId);

  // Get current date and time
  const now = new Date();
  const currentDate = now.toLocaleDateString();
  const currentHour = now.getHours();
  const currentMinutes = String(now.getMinutes()).padStart(2, "0");

  // Fetch creator details using original_creator_id stored in the snapshot
  const collectionWithUsers = await Promise.all(
    collection.map(async (item: any) => {
      let user = item.original_creator;

      if (!user && item.original_creator_id) {
        user = await getUserById(item.original_creator_id);
      }

      return {
        ...item,
        user,
      };
    }),
  );

  return (
    <div className="print-page min-h-screen flex items-center justify-center">
      <div className="receipt-container font-mono bg-white text-center flex flex-col gap-4 w-full max-w-sm mx-auto p-4 border shadow-sm">
        {/* Header */}
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
          <div className="w-[25%] text-right">DURATION</div>
        </div>

        <hr />

        {/* Collection items (snapshots) */}
        <ul className="flex flex-col gap-3 list-none p-0 m-0 w-full">
          {collectionWithUsers.map((item: any) => {
            return (
              <li
                key={item.id}
                className="flex flex-row justify-between items-start"
              >
                {/* Recommendation details */}
                <div className="flex flex-col flex-1 justify-start text-left text-sm w-[75%]">
                  <p className="text-md font-bold tracking-wide leading-wide">
                    {item.song_name} · {item.song_artist}
                  </p>

                  <p className="text-xs tracking-wide leading-wide mb-2">
                    Recommended by @{item.user?.display_name || "Unknown"}
                  </p>

                  <p className="text-xs tracking-wide leading-wide">
                    &quot;{item.message}&quot;
                  </p>
                </div>

                {/* Song duration */}
                <div className="w-[25%] text-right text-sm">
                  <p>{formatDuration(item.song_duration)}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <hr />

        {/* Thank you + QR code */}
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <div className="font-bold text-xl">THANKS FOR VISITING!</div>
          <img
            className="w-40 h-40"
            src="/assets/qr-code.png"
            alt="QR Code to meloplaza"
          />
          <p className="text-sm text-center w-50">
            Scan the QR code above to visit meloplaza again!
          </p>
        </div>
      </div>

      {/* Print button */}
      <div className="print:hidden fixed top-6 right-6 z-50">
        <PrintButton />
      </div>

      {/* Back button */}
      <div className="print:hidden fixed top-6 left-6 z-50">
        <Button label="Back" href={backHref} />
      </div>
    </div>
  );
}