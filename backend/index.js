import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import dotenv from 'dotenv';
dotenv.config(); // Load .env variables

import OpenAI from 'openai';

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Initialize OpenAI with environment variables
const openai = new OpenAI({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_API_KEY
});

// Root route for testing
app.get('/', (req, res) => {
  res.send('MoodTunes API is running!');
});

// Chat completion route
app.post('/', async (req, res) => {
  try {
    const { chats } = req.body;

    const result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Welcome to MoodTunes!" },
        ...chats
      ]
    });

    res.json({
      output: result.choices[0].message
    });

  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
