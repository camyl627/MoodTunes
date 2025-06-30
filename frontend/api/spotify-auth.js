// Spotify OAuth Authentication API
import { getUserProfile, createPlaylist, addTracksToPlaylist } from './spotify.js';

// ✅ Load environment variables
if (process.env.NODE_ENV !== "production") {
  try {
    const dotenv = await import("dotenv");
    const envPath = new URL("../../.env.local", import.meta.url).pathname;
    dotenv.config({ path: envPath });
  } catch (e) {
    console.warn("⚠️ Failed to load .env.local:", e.message);
  }
}

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? 'https://mood-tunes-x71zoblnz-camyl-richie-giles-projects.vercel.app/api/spotify-callback'
  : 'http://localhost:3000/api/spotify-callback';

// 🎵 Generate Spotify authorization URL
export function getSpotifyAuthURL() {
  const scopes = [
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-private',
    'user-read-email'
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: REDIRECT_URI,
    state: 'moodtunes_auth'
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// 🎵 Exchange authorization code for access token
export async function exchangeCodeForToken(code) {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

// 🎵 Create playlist in user's Spotify account
export async function createSpotifyPlaylist(accessToken, playlistName, songs) {
  try {
    // Get user profile
    const userProfile = await getUserProfile(accessToken);
    if (!userProfile) {
      throw new Error('Failed to get user profile');
    }

    // Create playlist
    const playlist = await createPlaylist(
      accessToken, 
      userProfile.id, 
      playlistName, 
      `Created by MoodTunes - ${new Date().toLocaleDateString()}`
    );

    if (!playlist) {
      throw new Error('Failed to create playlist');
    }

    // Add tracks to playlist
    if (songs && songs.length > 0) {
      const trackUris = songs
        .filter(song => song.spotify?.track_id)
        .map(song => `spotify:track:${song.spotify.track_id}`);

      if (trackUris.length > 0) {
        await addTracksToPlaylist(accessToken, playlist.id, trackUris);
      }
    }

    return {
      success: true,
      playlist: {
        id: playlist.id,
        name: playlist.name,
        url: playlist.external_urls.spotify,
        trackCount: songs.length
      }
    };

  } catch (error) {
    console.error('Error creating Spotify playlist:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 🚀 Main API handler for Spotify authentication
export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Generate auth URL
    const authUrl = getSpotifyAuthURL();
    return res.status(200).json({ authUrl });
  }

  if (req.method === 'POST') {
    const { action, code, accessToken, playlistName, songs } = req.body;

    try {
      if (action === 'exchange_token') {
        // Exchange code for token
        const tokenData = await exchangeCodeForToken(code);
        return res.status(200).json(tokenData);
      }

      if (action === 'create_playlist') {
        // Create playlist
        const result = await createSpotifyPlaylist(accessToken, playlistName, songs);
        return res.status(200).json(result);
      }

      return res.status(400).json({ error: 'Invalid action' });

    } catch (error) {
      console.error('Spotify auth error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
