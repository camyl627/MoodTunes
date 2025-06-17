import express, { response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';

const app = express();
const port = 3001;
app.use(bodyParser.json());
app.use(cors());

const openai = new OpenAI({
  organization: "org-MKcdgrhERRlj56SAxa17ICEh",
  apiKey: "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"
});

app.post('/', async (request, response) => {
    const {chats} = request.body;

    const result = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "Welcome to MoodTunes!",
            }
            , ...chats
        ]
    });

    response.json(
        {
            output: result.choices[0].message,
        }
    )
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})
