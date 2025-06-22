import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG,
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { chats } = req.body;

  // Validate input
  if (!Array.isArray(chats) || chats.length === 0) {
    return res.status(400).json({ error: "Invalid or missing 'chats'" });
  }

  try {
    // Generate AI response using lyrics-first format
    const result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are MoodTunes, an AI music companion. When a user shares a mood or feeling, respond with:

1. A short lyrics snippet that matches the mood (either real or inspired).
2. On the next line, write the matching song title and artist.

Format exactly like this:
"short lyrics here"
— Song Title by Artist`,
        },
        ...chats,
      ],
    });

    const message = result.choices?.[0]?.message;

    return res.status(200).json({ output: message });
  } catch (err) {
    console.error("OpenAI error:", err);
    return res.status(500).json({ error: "Something went wrong with OpenAI." });
  }
}
