/**
 * Local development server - mimics Edgespark backend
 * Run with: npx tsx local-server.ts
 */
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const ARK_API_KEY = "5fd30a51-af34-41b5-a3e1-025be2224659";

// Prompt templates for 9 styles - all with pixel art base
const PIXEL_BASE = "pixel art style, 16-bit retro game character, pixelated, clean pixel edges, limited color palette, game sprite aesthetic";
const PIXEL_SUFFIX = "masterpiece pixel art, clean pixels, no anti-aliasing, retro game style, detailed pixel work, nostalgic 16-bit era";

const PROMPT_TEMPLATES: Record<string, { prefix: string; suffix: string }> = {
  pixel: {
    prefix: `${PIXEL_BASE}, original character portrait, game avatar, RPG character`,
    suffix: `${PIXEL_SUFFIX}, vibrant colors, charming pixel character design`
  },
  anime: {
    prefix: `${PIXEL_BASE}, anime pixel art style, cel shading pixels, vibrant colors, beautiful anime sprite`,
    suffix: `${PIXEL_SUFFIX}, expressive pixel eyes, anime character design`
  },
  cyberpunk: {
    prefix: `${PIXEL_BASE}, cyberpunk pixel art, futuristic, neon pixel lights, high-tech, cyber aesthetic`,
    suffix: `${PIXEL_SUFFIX}, cyberpunk 2077 pixel style, blade runner pixel aesthetic`
  },
  chinese: {
    prefix: `${PIXEL_BASE}, traditional Chinese pixel style, hanfu pixels, ancient China aesthetic, elegant sprite`,
    suffix: `${PIXEL_SUFFIX}, traditional Chinese pixel art, beautiful composition`
  },
  realistic: {
    prefix: `${PIXEL_BASE}, detailed pixel portrait, high pixel detail, professional pixel art`,
    suffix: `${PIXEL_SUFFIX}, sharp pixel focus, natural pixel colors`
  },
  chibi: {
    prefix: `${PIXEL_BASE}, chibi pixel style, cute kawaii pixels, super deformed sprite, big head small body`,
    suffix: `${PIXEL_SUFFIX}, cute chibi pixel art, kawaii pixel aesthetic`
  },
  gothic: {
    prefix: `${PIXEL_BASE}, dark gothic pixel style, mysterious, elegant goth pixel fashion, dark fantasy pixels`,
    suffix: `${PIXEL_SUFFIX}, moody pixel atmosphere, high contrast pixels`
  },
  fantasy: {
    prefix: `${PIXEL_BASE}, fantasy pixel style, magical, mystical pixel character, enchanted pixel atmosphere`,
    suffix: `${PIXEL_SUFFIX}, magical pixel lighting, epic pixel composition`
  },
  urban: {
    prefix: `${PIXEL_BASE}, modern urban pixel style, contemporary pixel fashion, city pixel background`,
    suffix: `${PIXEL_SUFFIX}, natural pixel lighting, urban pixel aesthetic`
  }
};

const app = new Hono();

// Enable CORS for local development
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));

// Health check
app.get('/api/public/health', (c) => c.json({ status: 'ok', message: 'Local Dev Server' }));

// Get styles list
app.get('/api/public/styles', (c) => {
  return c.json({
    styles: Object.keys(PROMPT_TEMPLATES).map(id => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1)
    }))
  });
});

// Generate images with Doubao API
app.post('/api/generate', async (c) => {
  const { styleId, description } = await c.req.json();
  console.log('[LOCAL] POST /api/generate - styleId:', styleId, 'description:', description);

  if (!styleId || !description) {
    return c.json({ error: 'styleId and description are required' }, 400);
  }

  const template = PROMPT_TEMPLATES[styleId];
  if (!template) {
    return c.json({ error: 'Invalid style' }, 400);
  }

  const fullPrompt = `${template.prefix}, ${description}, ${template.suffix}`;
  console.log('[LOCAL] Full prompt:', fullPrompt);

  try {
    const images: string[] = [];

    // Generate 4 images using Doubao API
    for (let i = 0; i < 4; i++) {
      console.log(`[LOCAL] Generating image ${i + 1}/4...`);
      
      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ARK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'doubao-seedream-4-5-251128',
          prompt: fullPrompt,
          response_format: 'url',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[LOCAL] Doubao API error:', errorData);
        throw new Error(`Doubao API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.data && data.data.length > 0 && data.data[0].url) {
        images.push(data.data[0].url);
        console.log(`[LOCAL] Image ${i + 1} generated successfully`);
      }
    }

    console.log('[LOCAL] Generated', images.length, 'images');
    return c.json({ images, prompt: fullPrompt });
  } catch (error: any) {
    console.error('[LOCAL] Generation error:', error.message);
    return c.json({ error: 'Failed to generate images: ' + error.message }, 500);
  }
});

// Mock endpoints for other features
app.get('/api/public/community', (c) => {
  return c.json({ characters: [] });
});

app.get('/api/characters/my', (c) => {
  return c.json({ characters: [] });
});

app.post('/api/characters', async (c) => {
  const body = await c.req.json();
  console.log('[LOCAL] Create character:', body);
  return c.json({ character: { id: Date.now(), ...body } });
});

const port = 3001;
console.log(`🚀 Local backend server running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
