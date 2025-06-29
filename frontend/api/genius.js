// 🎵 Search for a song on Genius
async function searchGeniusSong(song, artist) {
  const GENIUS_API_KEY = process.env.GENIUS_ACCESS_TOKEN;

  if (!GENIUS_API_KEY) {
    console.warn("⚠️ No Genius API key found");
    return null;
  }

  const query = encodeURIComponent(`${song} ${artist}`);
  const searchUrl = `https://api.genius.com/search?q=${query}`;

  try {
    const res = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${GENIUS_API_KEY}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.warn("⚠️ Genius API error:", errorText);

      // Check if it's an authentication error
      if (res.status === 401 || errorText.includes('invalid_token')) {
        console.warn("⚠️ Genius API token is invalid or expired");
      }

      return null;
    }

    const data = await res.json();
    const hits = data.response?.hits;

    if (!hits || hits.length === 0) {
      return null;
    }

    // Find the best match
    const bestMatch = hits.find(hit => {
      const result = hit.result;
      const titleMatch = result.title.toLowerCase().includes(song.toLowerCase());
      const artistMatch = result.primary_artist.name.toLowerCase().includes(artist.toLowerCase());
      return titleMatch && artistMatch;
    }) || hits[0];

    return bestMatch?.result;
  } catch (error) {
    console.warn("⚠️ Error searching Genius:", error.message);
    return null;
  }
}

// 🎵 Get song details from Genius
async function getSongDetails(songId) {
  const GENIUS_API_KEY = process.env.GENIUS_ACCESS_TOKEN;

  if (!GENIUS_API_KEY) {
    return null;
  }

  try {
    const res = await fetch(`https://api.genius.com/songs/${songId}`, {
      headers: {
        Authorization: `Bearer ${GENIUS_API_KEY}`,
      },
    });

    if (!res.ok) {
      console.warn("⚠️ Failed to get song details from Genius");
      return null;
    }

    const data = await res.json();
    return data.response?.song;
  } catch (error) {
    console.warn("⚠️ Error getting song details:", error.message);
    return null;
  }
}

// 🎵 Generate rich fallback content when Genius API is unavailable
function generateRichFallback(song, artist) {
  const musicInsights = [
    "This track perfectly captures the emotional essence of your current mood.",
    "The lyrics of this song resonate deeply with listeners who share your vibe.",
    "This artist is known for creating music that speaks to the soul.",
    "The melody and lyrics work together to create a powerful emotional experience.",
    "This song has touched countless hearts with its meaningful message.",
    "The poetic nature of these lyrics makes this track truly special.",
    "This is the kind of song that stays with you long after it ends."
  ];

  const randomInsight = musicInsights[Math.floor(Math.random() * musicInsights.length)];

  return {
    content: `🎵 "${song}" by ${artist}

${randomInsight}

🎶 Music has this incredible power to connect us with our emotions and memories. This particular track was chosen specifically to match your current mood and energy.

✨ The combination of melody, rhythm, and lyrics in this song creates a perfect soundtrack for your feelings right now.

🎧 Take a moment to really listen to the words and let the music wash over you. Sometimes the most powerful lyrics are the ones that speak directly to our hearts.

📖 Click the Genius link below to dive deeper into the full lyrics and discover the story behind this beautiful song!`,
    url: null,
    title: song,
    artist: artist
  };
}

// 🎵 Fetch lyrics from Genius (returns meaningful content)
export async function fetchLyrics(song, artist) {
  try {
    const geniusSong = await searchGeniusSong(song, artist);

    if (!geniusSong) {
      console.log("🎵 Using enhanced fallback for lyrics");
      return generateRichFallback(song, artist);
    }

    // Get detailed song information
    const songDetails = await getSongDetails(geniusSong.id);

    if (songDetails) {
      // Extract meaningful information about the song
      const description = songDetails.description?.plain || "";
      const annotation = songDetails.annotation_count > 0 ?
        `This song has ${songDetails.annotation_count} annotations explaining its meaning.` : "";

      // Get release info
      const releaseDate = songDetails.release_date_for_display;
      const album = songDetails.album?.name;

      let lyricsInfo = `🎵 "${songDetails.title}" by ${songDetails.primary_artist.name}`;

      if (releaseDate) {
        lyricsInfo += ` (${releaseDate})`;
      }

      if (album) {
        lyricsInfo += ` from the album "${album}"`;
      }

      if (description && description.length > 0) {
        const shortDescription = description.length > 300
          ? description.substring(0, 300) + "..."
          : description;
        lyricsInfo += `\n\n${shortDescription}`;
      }

      if (annotation) {
        lyricsInfo += `\n\n${annotation}`;
      }

      lyricsInfo += "\n\n🎶 Click the Genius link below to read the full lyrics and explore detailed annotations!";

      return {
        content: lyricsInfo,
        url: songDetails.url,
        title: songDetails.title,
        artist: songDetails.primary_artist.name
      };
    }

    // Fallback to basic info with Genius data
    return {
      content: `🎵 "${geniusSong.title}" by ${geniusSong.primary_artist.name} - A beautiful track that resonates with your current vibe. Check out the full lyrics on Genius!`,
      url: geniusSong.url,
      title: geniusSong.title,
      artist: geniusSong.primary_artist.name
    };

  } catch (error) {
    console.warn("⚠️ Genius API unavailable, using enhanced fallback");
    return generateRichFallback(song, artist);
  }
}
