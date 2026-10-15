import { getCurrentUserId, getUserCollection } from "@/app/actions";
import Collection from "@/components/Collection";

export default async function CollectionPage() {
  const userId = await getCurrentUserId();

  // If no user is logged in, pass an empty collection array
  if (!userId) {
    return (
      <div className="w-full h-screen overflow-hidden flex items-center justify-center p-6 sm:p-12">
        <Collection collection={[]} />
      </div>
    );
  }

  const collection = await getUserCollection(userId);

  return (
    <div className="w-full h-screen overflow-hidden flex items-center justify-center p-6 sm:p-12">
      <Collection collection={collection} />
    </div>
  );
}