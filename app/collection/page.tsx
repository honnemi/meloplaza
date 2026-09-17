import { getUserCollection } from "@/app/actions";
import Collection from "@/components/Collection";

export default async function CollectionPage() {
  const collection = await getUserCollection();

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 sm:p-12">
      <Collection collection={collection} />
    </div>
  );
}
