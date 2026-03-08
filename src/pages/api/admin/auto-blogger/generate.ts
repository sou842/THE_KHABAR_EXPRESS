import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Very basic check that they provided an API token.
  // We can't easily validate against EXTERNAL_API_SECRET_TOKEN here unless we import it,
  const token = req.headers['x-api-token'];
  const expectedToken = process.env.EXTERNAL_API_SECRET_TOKEN || 'fallback_development_token_change_me';

  if (!token || token !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API token' });
  }

  const { prompt, model } = req.body;

  if (!prompt || !model) {
    return res.status(400).json({ error: 'Missing prompt or model' });
  }

  try {
    if (model === 'gemini-2.5-flash') {
      const apiKey = process.env.NEXT_PUBLIC_SUMMERY_API_KEY || process.env.SUMMERY_API_KEY;
      if (!apiKey) {
        console.error("Gemini API key is not configured on the server.");
        return res.status(500).json({ error: "Gemini API key is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
          tools: [{ googleSearch: {} }],
        },
      });

      if (!response.text) {
        console.error("Gemini returned an empty response.");
        return res.status(500).json({ error: "Gemini returned an empty response." });
      }

      return res.status(200).json({ text: response.text });
    } else {
      // OpenRouter fetch logic exactly as defined in the plan
      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterApiKey) {
        console.error("OpenRouter API key is not configured on the server.");
        return res.status(500).json({ error: "OpenRouter API key is not configured on the server." });
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "HTTP-Referer": "https://thekhabarexpress.com",
          "X-Title": "The Khabar Express",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("OpenRouter HTTP error:", response.status);
        return res.status(500).json({ error: `OpenRouter HTTP error: ${response.status}` });
      }

      const text = data?.choices?.[0]?.message?.content;
      if (!text) {
        console.error("OpenRouter returned an empty response.");
        return res.status(500).json({ error: "OpenRouter returned an empty response." });
      }

      return res.status(200).json({ text: text });
    }
  } catch (error: any) {
    console.error('Server-side generation error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during generation.' });
  }
}
