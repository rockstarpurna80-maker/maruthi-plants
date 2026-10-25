import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Server-Side Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Default System Instruction for Maruthi Nursery Gardening & Plant Assistant
const DEFAULT_SYSTEM_INSTRUCTION = `You are "Maruthi Haritha", the friendly and highly knowledgeable Chief Horticultural Advisor at Maruthi Nursery located in Malladi Village, Amaravathi Road, Guntur District, Andhra Pradesh (WhatsApp/Call: +91 9515369395).
Your role:
1. Provide practical, accurate botanical and cultivation advice for fruit orchards (Banganapalli mango, Thai pink guava, Balaji Kagzi lime, sweet jackfruit), flowering shrubs (Mogra jasmine, temple champa, hybrid hibiscus, bougainvillea), indoor air-purifiers (Areca palm, snake plant, ZZ plant, fiddle leaf fig), and shade trees (Neem, Foxtail palm).
2. Deeply understand local Andhra Pradesh soils (Guntur black cotton soil and red loamy soil), summer heat management (40°C+ March-May), monsoon pit preparation, organic vermicompost, and neem oil pest control.
3. Be courteous, encouraging, and fluent in both English and Telugu gardening context (use Telugu plant names alongside English where helpful).
4. Direct users to visit the nursery in Malladi Village on Amaravathi Road or contact WhatsApp at +91 9515369395 for live sapling inspection and transport.`;

// 1. Multi-turn Chat Endpoint with Gemini (gemini-3.8-flash, gemini-3.1-flash-lite, gemini-4-argon)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, model = 'gemini-3.8-flash', systemInstruction } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Map conversation history
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: Array.isArray(m.parts) ? m.parts : [{ text: m.text || '' }],
    }));

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
      },
    });

    return res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate chat response from Gemini.',
    });
  }
});

// 2. Audio Transcription Endpoint (model: gemini-3.5-transcribe)
app.post('/api/gemini/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio base64 data is required.' });
    }

    const audioPart = {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Transcribe this spoken speech accurately. Support Telugu or English words accurately.' },
        ],
      },
    });

    return res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Audio transcription error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to transcribe audio with gemini-3.5-transcribe.',
    });
  }
});

// 3. Google Maps Grounding Endpoint (model: gemini-3.8-flash with googleMaps tool)
app.post('/api/gemini/maps-grounding', async (req, res) => {
  try {
    const { query, latitude = 16.38, longitude = 80.37 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: Number(latitude),
              longitude: Number(longitude),
            },
          },
        },
      },
    });

    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return res.json({
      text: response.text || '',
      groundingChunks,
    });
  } catch (error: any) {
    console.error('Google Maps grounding error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to query Google Maps grounding.',
    });
  }
});

// 4. Animate Image into Video Endpoint (Interactions API with gemini-omni-1.1-flash)
app.post('/api/gemini/animate-video', async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/png',
      prompt = 'Cinematic gentle breeze swaying through the plant foliage in natural golden daylight.',
      aspectRatio = '16:9',
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Base64 image is required.' });
    }

    const interaction = await ai.interactions.create(
      {
        model: 'gemini-omni-1.1-flash',
        input: [
          {
            type: 'image',
            mime_type: mimeType,
            data: imageBase64,
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: aspectRatio === '9:16' ? '9:16' : '16:9',
          duration: '5s',
          resolution: '720p',
        },
      },
      { timeout: 300000 }
    );

    const videoPart = interaction.output_video;
    if (videoPart && videoPart.data) {
      return res.json({
        videoBase64: videoPart.data,
        mimeType: videoPart.mime_type || 'video/mp4',
      });
    }

    return res.status(500).json({
      error: 'Video generated but no video payload was returned.',
    });
  } catch (error: any) {
    console.error('Animate image to video error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to animate image with gemini-omni-1.1-flash.',
    });
  }
});

// Vite middleware in dev, static in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Maruthi Nursery server running on http://0.0.0.0:${port}`);
});
