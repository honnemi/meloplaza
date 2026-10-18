import {
  getCurrentUserId,
  getUserCollection,
  getUserRecommendations,
} from "@/app/actions";
import Collection, { MyRecommendationItem } from "@/components/Collection";

export default async function CollectionPage() {
  const userId = await getCurrentUserId();

  // If no user is logged in, pass empty arrays
  if (!userId) {
    return <Collection collection={[]} myRecommendations={[]} />;
  }

  const [collection, recommendations] = await Promise.all([
    getUserCollection(userId),
    getUserRecommendations(userId),
  ]);

  // Newest first, so index 0 is the user's current recommendation.
  const myRecommendations: MyRecommendationItem[] = recommendations.map(
    (r, index) => ({
      id: r.id,
      song_name: r.song_name ?? "",
      song_artist: r.song_artist ?? "",
      song_album: r.song_album ?? "",
      song_album_cover: r.song_album_cover ?? "",
      song_year: r.song_year ?? "",
      prompt: r.prompt ?? "",
      message: r.message ?? "",
      collection_count: r.collection_count,
      created_at: r.created_at,
      is_current: index === 0,
    }),
  );

  // Collection renders its own full-page wrapper, so no extra h-screen /
  // overflow-hidden wrapper here (it clipped content on short screens).
  return (
    <Collection collection={collection} myRecommendations={myRecommendations} />
  );
}