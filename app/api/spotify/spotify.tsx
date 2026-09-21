let cachedToken: string | null = null;
let tokenExpiresAt = 0;

// Get a Spotify Client Credentials access token
export async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in environment variables."
    );
  }

  // Reuse the cached token if it still has more than 60 seconds left
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",

    // Don't let Next.js cache the token request itself
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();

    console.error("Spotify authentication failed:", {
      status: res.status,
      statusText: res.statusText,
      body: errorText,
    });

    throw new Error("Failed to authenticate with Spotify");
  }

  const data = await res.json();

  if (!data.access_token) {
    throw new Error("Spotify did not return an access token.");
  }

  // Save the token in server memory
  cachedToken = data.access_token;

  // Spotify returns expires_in in seconds
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  return cachedToken;
}

// Fetch tracks from Spotify
export default async function getSpotifyTracks(query: string) {
  if (!query?.trim()) {
    return {
      tracks: {
        items: [],
      },
    };
  }

  const accessToken = await getAccessToken();

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query
    )}&type=track&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      // Cache Spotify search results for 1 hour
      next: {
        revalidate: 3600,
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();

    console.error("Spotify search failed:", {
      status: res.status,
      statusText: res.statusText,
      query,
      body: errorText,
    });

    throw new Error(
      `Failed to fetch from Spotify (${res.status} ${res.statusText})`
    );
  }

  return res.json();
}