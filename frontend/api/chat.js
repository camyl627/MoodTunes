import OpenAI from "openai";
import { searchTrack } from "@/utils/spotify"; // You must handle accessToken in this
import { fetchLyrics } from "@/utils/genius"; // You must implement Genius scraping

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { chats } = req.body;

  if (!Array.isArray(chats) || chats.length === 0) {
    return res.status(400).json({ error: "Invalid or missing 'chats'" });
  }

  try {
    // Step 1: Use OpenAI to interpret mood and suggest a song
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You're MoodTunes, an AI that takes in a user's mood and replies with a lyrics snippet and a matching song in this exact format:

"short lyric quote"
— Song Title by Artist`,
        },
        ...chats,
      ],
    });

    const content = completion.choices?.[0]?.message?.content;
    const lines = content.split("\n— ");
    if (lines.length !== 2) {
      return res.status(500).json({ error: "AI output is not in expected format." });
    }

    const lyricsSnippet = lines[0].replace(/^"|"$/g, "").trim();
    const [songTitle, artist] = lines[1].split(" by ");

    if (!songTitle || !artist) {
      return res.status(500).json({ error: "Could not extract song or artist." });
    }

    // Step 2: Search Spotify for song
    const spotifyTrack = await searchTrack(songTitle.trim(), artist.trim());
    if (!spotifyTrack) {
      return res.status(404).json({ error: "Track not found on Spotify." });
    }

    // Step 3: Search Genius for lyrics
    const fullLyrics = await fetchLyrics(songTitle.trim(), artist.trim());

    return res.status(200).json({
      output: {
        lyricsSnippet,
        songTitle: songTitle.trim(),
        artist: artist.trim(),
        lyrics: fullLyrics || "Lyrics not available.",
        spotify: {
          name: spotifyTrack.name,
          preview_url: spotifyTrack.preview_url,
          external_url: spotifyTrack.external_urls.spotify,
          embed_url: `https://open.spotify.com/embed/track/${spotifyTrack.id}`,
        },
        geniusUrl: `https://genius.com/search?q=${encodeURIComponent(`${songTitle.trim()} ${artist.trim()}`)}`,
      },
    });
  } catch (err) {
    console.error("MoodTunes API Error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
