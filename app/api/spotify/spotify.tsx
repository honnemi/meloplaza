// 1. Helper function to fetch a temporary Client Credentials access token
export async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in environment variables.");
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    next: { revalidate: 3500 }, // Cache token for slightly less than Spotify's 1-hour (3600s) expiry
  });

  if (!res.ok) {
    throw new Error("Failed to authenticate with Spotify");
  }

  const data = await res.json();
  return data.access_token;
}

// 2. Fetch tracks using the dynamically retrieved access token
export default async function getSpotifyTracks(query: string) {
  if (!query) return { tracks: { items: [] } };

  // Get the token dynamically
  const accessToken = await getAccessToken();

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 3600 }, // Cache search query results for an hour
    }
  );

  if (!res.ok) throw new Error("Failed to fetch from Spotify");
  return res.json();
}