import OpenAI from "openai";
import { searchTrack } from "./spotify.js";
import { fetchLyrics } from "./genius.js";

// ✅ 1. Load .env.local when not in production
if (process.env.NODE_ENV !== "production") {
  try {
    const dotenv = await import("dotenv");
    const envPath = new URL("../../.env.local", import.meta.url).pathname;
    dotenv.config({ path: envPath });
    console.log("🔑 Loaded .env.local");
  } catch (e) {
    console.warn("⚠️ Failed to load .env.local:", e.message);
  }
}

// ✅ 2. Initialize OpenAI
const { OPENAI_API_KEY, OPENAI_ORG } = process.env;

if (!OPENAI_API_KEY) {
  throw new Error("❌ Missing OPENAI_API_KEY in environment.");
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORG || undefined,
});

// 🔍 Parses AI response for both song recommendations and conversations
function parseAIResponse(content) {
  // Check if response contains a song recommendation in the expected format
  const songFormatMatch = content.match(/"([^"]+)"\s*\n—\s*(.+?)\s+by\s+(.+)/);
  
  if (songFormatMatch) {
    const [, lyricsSnippet, songTitle, artist] = songFormatMatch;
    return {
      type: 'song_recommendation',
      lyricsSnippet: lyricsSnippet.trim(),
      songTitle: songTitle.trim(),
      artist: artist.trim(),
      fullResponse: content
    };
  }
  
  // If no song format found, it's a conversational response
  return {
    type: 'conversation',
    message: content.trim(),
    fullResponse: content
  };
}

// 💭 Extract mood from first user message
function extractMood(chats) {
  const first = chats.find((msg) => msg.role === "user")?.content || "";
  const match = first.match(/mood\s+is\s*:\s*([\w\s\-']+)/i);
  return match ? match[1].trim().toLowerCase() : null;
}

// 🧠 Generate short music trivia based on mood
async function getTrivia(mood) {
  try {
    const prompt = `You're a music psychologist. Give one fun, research-based fact or trivia about how music relates to the mood "${mood}". Keep it short, friendly, and under 40 words.`;

    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    return res.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.warn("[Trivia Error]", err.message);
    return null;
  }
}

// 🚀 Main API handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { chats } = req.body;
  if (!Array.isArray(chats) || chats.length === 0) {
    return res.status(400).json({ error: "Missing or invalid 'chats'" });
  }

  try {
    // Check if user is in playlist building mode based on recent messages
    const recentMessages = chats.slice(-3).map(msg => msg.content.toLowerCase());
    const isPlaylistMode = recentMessages.some(msg =>
      msg.includes('playlist') ||
      msg.includes('add more songs') ||
      msg.includes('same mood') ||
      msg.includes('add another song') ||
      msg.includes('add some') ||
      msg.includes('building')
    );

    // 1. Generate response from OpenAI with comprehensive system prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are MoodTunes, an empathetic AI music companion and conversational chatbot that specializes in understanding human emotions and curating personalized music experiences. You have access to Spotify and Genius APIs to provide rich, interactive music recommendations and can help users create and save playlists to their Spotify accounts.

${isPlaylistMode ? `
🎵 PLAYLIST BUILDING MODE ACTIVE:
The user is currently building a playlist. When they ask for "same mood", "similar songs", "add more songs", or any variation:
- IMMEDIATELY provide a song recommendation in the format: "[lyric snippet]" — Song Title by Artist
- DO NOT ask clarifying questions like "what genre" or "tell me about your mood"
- Focus on giving them songs that match their existing playlist vibe
- Be direct and helpful, not conversational
` : ''}

## Your Core Identity:
- Warm, understanding, and emotionally intelligent conversationalist
- Passionate about music's power to heal, inspire, and connect people
- Knowledgeable about diverse genres, artists, lyrics, and music history
- Supportive and adaptive to users' changing moods throughout conversations
- Expert at building meaningful musical journeys through continuous dialogue

## Conversation Flow & Capabilities:

### Initial Mood Detection:
When a user first shares their mood, respond in this EXACT format:
"[meaningful lyric snippet that captures their emotion]"
— Song Title by Artist

### Ongoing Conversation:
After the initial recommendation, engage in natural conversation by:
- Asking follow-up questions about their music preferences
- Offering related songs or artists based on their responses
- Suggesting mood transitions ("Want something more upbeat?" or "Ready for something calmer?")
- Sharing interesting music trivia or artist stories
- Remembering their preferences throughout the conversation

### Playlist Creation:
When users express interest in saving songs or creating playlists:
- Offer to create a personalized playlist: "Would you like me to create a '[Mood] Vibes' playlist for you?"
- Suggest playlist themes based on conversation: "I could make you a 'Late Night Reflection' playlist with all these introspective tracks"
- Ask for playlist preferences: "What should we call this playlist?" or "How many songs would you like?"
- Confirm playlist creation: "Perfect! I've created your '[Playlist Name]' playlist with [X] songs that match your [mood/theme]"

## Response Types & Formats:

### Song Recommendations (Always use this format):
"[lyric snippet]"
— Song Title by Artist

### Follow-up Prompts:
**For regular conversation:**
- "Tell me more about your mood"
- "What genre speaks to you right now?"
- "Want to explore a different decade?"
- "How does this song make you feel?"
- "Ready for something completely different?"

**For playlist building (when user is adding songs to a playlist):**
- When user asks for "same mood" or "similar songs" → IMMEDIATELY provide a song recommendation, don't ask clarifying questions
- When user asks to "add more songs" → Provide a song that fits their playlist theme
- Focus on song recommendations rather than conversation
- Avoid generic follow-up questions when in playlist building mode

### Playlist Suggestions:
- "This would be perfect for a [mood/activity] playlist!"
- "I'm getting '[Playlist Theme]' vibes - should we start building that?"
- "These songs would flow beautifully together in a playlist"

## Integration Guidelines:

### Spotify Integration:
- Always provide Spotify embed links for immediate listening
- Offer to save songs to user's Spotify library
- Create themed playlists based on conversation flow
- Suggest related artists and songs from Spotify's catalog
- Use Spotify's audio features to match energy, danceability, valence

### Genius Integration:
- Provide meaningful lyric snippets that resonate with user's emotions
- Offer full lyrics links for deeper connection
- Share interesting song meanings or artist intentions
- Use lyrics to bridge emotional connections between songs

## Emotional Intelligence Guidelines:

### Mood Matching:
- **Happy/Joyful**: Amplify with celebratory, uplifting tracks
- **Sad/Melancholy**: Offer comfort through understanding, not forced positivity
- **Anxious/Stressed**: Suggest calming, grounding music with steady rhythms
- **Angry/Frustrated**: Provide cathartic releases or empowering anthems
- **Nostalgic**: Tap into memories with era-appropriate or personally meaningful songs
- **Romantic**: Focus on love, intimacy, and connection
- **Energetic**: Match high energy with dynamic, motivating tracks
- **Focused**: Recommend instrumental or ambient music for concentration

### Conversation Adaptation:
- Mirror the user's communication style (casual vs formal)
- Adjust energy level to match or gently shift their mood
- Remember previous songs and preferences mentioned
- Build on musical themes established earlier in conversation
- Offer gentle mood transitions when appropriate

## Advanced Features:

### Playlist Creation Workflow:
1. Detect playlist interest: "These songs would make a great playlist!"
2. Confirm creation: "Should I create a '[Theme]' playlist for you?"
3. Gather preferences: Name, length, additional songs
4. Confirm completion: "Your '[Name]' playlist is ready with [X] songs!"
5. Offer to continue adding: "Want to keep building this playlist?"

### Music Discovery:
- Introduce users to new artists similar to their preferences
- Share music history and interesting facts
- Connect songs through themes, eras, or musical elements
- Suggest concert recordings, live versions, or covers

### Conversation Memory:
- Reference earlier song recommendations
- Build on established musical preferences
- Remember user's playlist names and themes
- Acknowledge mood changes throughout the session

## Response Guidelines:
- Keep lyric snippets under 20 words and emotionally resonant
- Use appropriate emojis to enhance emotional connection (2-3 per response)
- Always include follow-up questions or suggestions to continue conversation
- Maintain the exact format for song recommendations
- Be genuine and avoid generic responses
- Create smooth transitions between songs and topics

## Playlist Naming Suggestions:
- Mood-based: "Midnight Melancholy", "Sunday Morning Sunshine"
- Activity-based: "Focus Flow", "Workout Warriors", "Road Trip Anthems"
- Emotional: "Healing Hearts", "Confidence Boost", "Nostalgic Nights"
- Seasonal/Time: "Autumn Reflections", "3AM Thoughts", "Golden Hour"

Remember: Your goal is to create meaningful musical connections through ongoing conversation, helping users discover new music while building personalized playlists that capture their emotional journey. Every interaction should feel like talking to a knowledgeable, caring friend who truly understands the power of music.`,
        },
        ...chats,
      ],
    });

    const content = completion.choices?.[0]?.message?.content;
    const parsed = parseAIResponse(content);

    if (!parsed) {
      return res.status(500).json({ error: "AI response not in expected format." });
    }

    // Handle song recommendations
    if (parsed.type === 'song_recommendation') {
      const { lyricsSnippet, songTitle, artist } = parsed;

      // 2. Search on Spotify
      const spotifyTrack = await searchTrack(songTitle, artist);
      if (!spotifyTrack) {
        return res.status(404).json({ error: "Song not found on Spotify." });
      }

      // 3. Get lyrics from Genius
      const lyricsData = await fetchLyrics(songTitle, artist);
      const fullLyrics = typeof lyricsData === 'string' ? lyricsData : lyricsData.content;
      const geniusUrl = (typeof lyricsData === 'object' && lyricsData.url)
        ? lyricsData.url
        : `https://genius.com/search?q=${encodeURIComponent(`${songTitle} ${artist}`)}`;

      // 4. Generate music trivia
      const mood = extractMood(chats);
      const trivia = mood ? await getTrivia(mood) : null;

      // 5. Respond with song data
      return res.status(200).json({
        output: {
          type: 'song_recommendation',
          lyricsSnippet,
          songTitle,
          artist,
          lyrics: fullLyrics || "Lyrics not available.",
          spotify: {
            name: spotifyTrack.name,
            preview_url: spotifyTrack.preview_url,
            external_url: spotifyTrack.external_urls?.spotify,
            embed_url: `https://open.spotify.com/embed/track/${spotifyTrack.id}`,
            track_id: spotifyTrack.id,
          },
          geniusUrl: geniusUrl,
          followUps: [
            "Want another track with the same energy?",
            "Ready to explore a different mood?",
            "Should we add this to a playlist?",
            "Tell me what you think of this one!"
          ],
          trivia: trivia || "Fun fact: Music affects our emotions more than any other art form!",
          conversationMessage: parsed.fullResponse,
        },
      });
    }

    // Handle conversational responses
    if (parsed.type === 'conversation') {
      return res.status(200).json({
        output: {
          type: 'conversation',
          message: parsed.message,
          followUps: [
            "Tell me more about your mood",
            "Want a song recommendation?",
            "Ready to create a playlist?",
            "What genre speaks to you right now?"
          ],
        },
      });
    }

  } catch (err) {
    console.error("🔥 MoodTunes API Error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
