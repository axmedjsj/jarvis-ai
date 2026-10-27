
import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY environment variable.');
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(express.static('.'));

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [...history, {
        role: 'user',
        parts: [{ text: message }]
      }],
      config: {
        systemInstruction:
          'You are J.A.R.V.I.S., a concise, polite, witty AI assistant. Speak clearly and helpfully.'
      }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'JARVIS could not respond. Try again.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`JARVIS is running on port ${PORT}`);
});
