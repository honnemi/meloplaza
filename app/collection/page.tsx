import { getUserCollection } from "@/app/actions";
import Collection from "@/components/Collection";
import Button from "@/components/Button";

export default async function CollectionPage() {
  const collection = await getUserCollection();

  return (
    <div className="w-full h-screen overflow-hidden flex items-center justify-center p-6 sm:p-12">
      <Collection collection={collection} />

      {/* Navigate to print page */}
            <div className="fixed top-6 right-6 z-50">
              <Button label="Print" href="/collection/print" />
            </div>

    </div>
  );
}
