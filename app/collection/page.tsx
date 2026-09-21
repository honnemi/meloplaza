import { getUserCollection } from "@/app/actions";
import Collection from "@/components/Collection";
import { Link } from "next-view-transitions";

export default async function CollectionPage() {
  const collection = await getUserCollection();

  return (

    <div className="w-full min-h-screen flex items-center justify-center p-6 sm:p-12">
      <Collection collection={collection} />
      <Link
        href="/collection/print"
        className="fixed right-20 top-20 text-center z-50 drop-shadow-md transition-transform duration-200 hover:-translate-y-1 hover:scale-110"
      >
        <img
          src="/assets/printer.png"
          alt="Printer"
          className="w-24 h-auto"
        />
        <p>Print</p>
      </Link>
    </div>
  );
}