import { BlogChunk } from "@/models/blogChunk.model";

// ─────────────────────────────────────────────
// Model Configuration
// ─────────────────────────────────────────────

const PRIMARY_MODEL = "stepfun/step-3.5-flash:free";
const FALLBACK_MODELS = [
  "nvidia/nemotron-nano-9b-v2:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
];
const ALL_MODELS = [PRIMARY_MODEL, ...FALLBACK_MODELS];

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface AiSummary {
  mainIdea: string;
  keyPoints: string[];
  finalTakeaway: string;
  suggestedQuestions: string[];
}

export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface CallOptions {
  jsonMode?: boolean;
  retryDelayMs?: number;
}

// ─────────────────────────────────────────────
// Core OpenRouter Caller (with silent fallback)
// ─────────────────────────────────────────────

/**
 * Tries each model in order. Failures are silent — the user is only
 * informed if every single model is exhausted.
 */
const callOpenRouter = async (
  messages: OpenRouterMessage[],
  options: CallOptions = {}
): Promise<string> => {
  const { jsonMode = false, retryDelayMs = 150 } = options;
  const apiKey = process.env.OPENROUTER_API_KEY ?? "";

  let lastError = "No models available";

  for (const model of ALL_MODELS) {
    try {
      // Small delay between retries to avoid hammering providers
      if (model !== PRIMARY_MODEL) {
        await new Promise((r) => setTimeout(r, retryDelayMs));
      }

      const body: Record<string, unknown> = {
        model,
        messages,
        ...(jsonMode && { response_format: { type: "json_object" } }),
      };

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://thekhabarexpress.com",
            "X-Title": "The Khabar Express",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      // Parse response body — if this fails, move to next model silently
      let data: Record<string, unknown>;
      try {
        data = await response.json();
      } catch {
        lastError = "Invalid JSON response from provider";
        continue;
      }

      // Rate limited — try next model silently
      if (
        response.status === 429 ||
        (data?.error as Record<string, unknown>)?.code === 429
      ) {
        lastError = "Rate limited";
        continue;
      }

      // Any other HTTP error — try next model silently
      if (!response.ok) {
        const errData = data?.error as Record<string, unknown> | undefined;
        lastError =
          (errData?.message as string) ?? `HTTP ${response.status}`;
        continue;
      }

      // Empty or missing content — try next model silently
      const content =
        (
          data?.choices as Array<{
            message?: { content?: string };
          }>
        )?.[0]?.message?.content ?? "";

      if (!content.trim()) {
        lastError = "Empty content received";
        continue;
      }

      // ✅ Success — return immediately without exposing which model was used
      return content;
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : String(error);
      continue;
    }
  }

  // ❌ All models failed — only NOW do we surface the error to the caller
  throw new Error(
    `Our AI service is temporarily unavailable. Please try again shortly. (${lastError})`
  );
};

// ─────────────────────────────────────────────
// Summary Generation
// ─────────────────────────────────────────────

export const generateSummary = async (
  content: string
): Promise<AiSummary> => {
const prompt = `You are a JSON-only content analyzer. Output ONLY a raw JSON object — no markdown, no explanation, no preamble. Start with { and end with }.

CONSTRAINTS:
- Use ONLY information explicitly stated in the article. No inference. No external knowledge.
- Every field must be grounded in article content.

ARTICLE:
${content}

REQUIRED OUTPUT:
{"mainIdea":"...","keyPoints":["...","...","..."],"finalTakeaway":"...","suggestedQuestions":["...","...","..."]}

FIELD RULES:

mainIdea: 1-2 sentences. State core subject and purpose grounded in the article's opening or central thesis. No opinions, no filler phrases like "This article discusses".

keyPoints: 3-4 items. Each must be a DISTINCT, standalone insight with no overlap. No vague language like "the article mentions" or "it talks about". Each must be falsifiable against the article.

finalTakeaway: 1-2 sentences. Synthesize the overall conclusion — do not restate a keyPoint.

suggestedQuestions: Exactly 3. Each answerable using only the article. Each covering a different aspect. Phrased as a curious reader would naturally ask.

Output must be valid JSON parseable by JSON.parse().`;

  const text = await callOpenRouter([{ role: "user", content: prompt }], {
    jsonMode: true,
  });

  // Strip any accidental markdown fences before parsing
  const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] ?? text;

  // Let the error propagate — callOpenRouter already threw a user-friendly
  // message if all models failed; a parse error here is a genuine bug.
  return JSON.parse(jsonStr) as AiSummary;
};

// ─────────────────────────────────────────────
// Q&A (Ask AI about an article)
// ─────────────────────────────────────────────

export const askAi = async (
  question: string,
  context: string,
  conversationHistory: string = ""
): Promise<string> => {
  const systemPrompt = `
You are an intelligent AI assistant integrated inside a blogging platform.
Your job is to help users understand an article and answer their questions
in a clear, friendly, and conversational way.

PRIMARY RESPONSIBILITIES
1. Help users understand the article.
2. Answer questions using the provided article context.
3. Maintain a natural conversation based on conversation history.
4. Provide helpful explanations when the user asks for clarification.

IMPORTANT RULES
1. Base your answers primarily on the provided article context.
2. If the answer is not in the article, respond with:
   "I'm sorry, but this article doesn't contain information about that."
3. Do NOT invent or hallucinate facts.
4. Keep answers clear, concise, and easy to understand.
5. Use conversation history to understand follow-up questions.
6. If users ask about the platform itself (publishing, accounts, features),
   answer using general knowledge about blogging platforms.
   Do NOT invent specific platform policies you are unsure about.

RESPONSE STYLE
- Clear and conversational
- Easy for general readers to understand
- You may reference the article with phrases like "The article explains that..."

Article Context:
${context}

Conversation History:
${conversationHistory}
`.trim();

  return callOpenRouter([
    { role: "system", content: systemPrompt },
    { role: "user", content: question },
  ]);
};

// ─────────────────────────────────────────────
// Embeddings
// ─────────────────────────────────────────────

/**
 * Tries PRIMARY_MODEL for embeddings first.
 * Falls back to a zero-vector silently if all attempts fail —
 * a degraded embedding is better than a hard crash for RAG.
 */
export const generateEmbeddings = async (
  text: string
): Promise<number[]> => {
  const apiKey = process.env.OPENROUTER_API_KEY ?? "";
  const embeddingModels = [PRIMARY_MODEL, ...FALLBACK_MODELS];

  for (const model of embeddingModels) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/embeddings",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ model, input: text }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.data?.[0]?.embedding) {
        continue; // silent, try next model
      }

      return data.data[0].embedding as number[];
    } catch {
      continue; // silent, try next model
    }
  }

  // All embedding models failed — return zero-vector fallback silently
  // (RAG will still work, just with reduced relevance for this chunk)
  return new Array(1536).fill(0);
};

// ─────────────────────────────────────────────
// Text Chunking
// ─────────────────────────────────────────────

export const chunkText = (
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] => {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex >= text.length) {
      endIndex = text.length;
    } else {
      // Prefer splitting at a sentence or newline boundary
      const lastPeriod = text.lastIndexOf(".", endIndex);
      const lastNewline = text.lastIndexOf("\n", endIndex);
      const splitPoint = Math.max(lastPeriod, lastNewline);

      if (splitPoint > startIndex + chunkSize * 0.5) {
        endIndex = splitPoint + 1;
      }
    }

    const chunk = text.substring(startIndex, endIndex).trim();
    if (chunk.length > 50) chunks.push(chunk);

    startIndex = endIndex - overlap;
    if (startIndex >= text.length || endIndex >= text.length) break;
  }

  return chunks;
};

// ─────────────────────────────────────────────
// RAG: Process Blog for Vector Storage
// ─────────────────────────────────────────────

export async function processBlogForRag(
  blogId: string,
  text: string
): Promise<void> {
  const existingChunks = await BlogChunk.countDocuments({ blogId });
  if (existingChunks > 0) return; // Already processed, skip silently

  const chunks = chunkText(text);

  for (let i = 0; i < chunks.length; i++) {
    try {
      const embedding = await generateEmbeddings(chunks[i]);
      await BlogChunk.create({
        blogId,
        content: chunks[i],
        embedding,
        index: i,
      });
    } catch {
      // One failed chunk should not abort the entire blog processing
      continue;
    }
  }
}
