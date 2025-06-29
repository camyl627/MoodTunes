// Assumes you have SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your .env
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const SEARCH_URL = "https://api.spotify.com/v1/search";

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const basicAuth = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error("Failed to get Spotify access token");
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000 - 60_000; // buffer 1 min
  return cachedToken;
}

export async function searchTrack(song, artist) {
  const token = await getAccessToken();

  const query = encodeURIComponent(`${song} ${artist}`);
  const res = await fetch(`${SEARCH_URL}?q=${query}&type=track&limit=1`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error("Spotify search failed:", await res.text());
    return null;
  }

  const data = await res.json();
  const track = data.tracks?.items?.[0];
  return track || null;
}

// 🎵 Create a new playlist (requires user authentication)
export async function createPlaylist(userAccessToken, userId, playlistName, description = "") {
  const res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: playlistName,
      description: description,
      public: false,
    }),
  });

  if (!res.ok) {
    console.error("Failed to create playlist:", await res.text());
    return null;
  }

  return await res.json();
}

// 🎵 Add tracks to a playlist
export async function addTracksToPlaylist(userAccessToken, playlistId, trackUris) {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uris: trackUris,
    }),
  });

  if (!res.ok) {
    console.error("Failed to add tracks to playlist:", await res.text());
    return null;
  }

  return await res.json();
}

// 🎵 Get user profile (requires user authentication)
export async function getUserProfile(userAccessToken) {
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
    },
  });

  if (!res.ok) {
    console.error("Failed to get user profile:", await res.text());
    return null;
  }

  return await res.json();
}
