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
  const prompt = `
You are a precise content analysis AI. Your sole function is to read the provided article and return a structured JSON summary.

═══════════════════════════════════════════
ABSOLUTE CONSTRAINTS (NEVER VIOLATE THESE)
═══════════════════════════════════════════
- Use ONLY information explicitly stated in the article.
- Do NOT infer, assume, or add external knowledge.
- Do NOT hallucinate facts, names, statistics, or claims.
- Do NOT output anything except a valid JSON object.
- Do NOT wrap output in markdown (no \`\`\`json blocks).
- Do NOT include explanations, comments, or preamble.
- The response must be directly parseable by JSON.parse().

═══════════════════════════════
ARTICLE CONTENT TO ANALYZE
═══════════════════════════════
${content}

═══════════════════════════════
REQUIRED OUTPUT STRUCTURE
═══════════════════════════════
{
  "mainIdea": "<string>",
  "keyPoints": ["<string>", "<string>", "<string>", "<string>"],
  "finalTakeaway": "<string>",
  "suggestedQuestions": ["<string>", "<string>", "<string>"]
}

═══════════════════════════════
FIELD-BY-FIELD RULES
═══════════════════════════════

"mainIdea"
- Exactly 1–2 sentences.
- State the article's core subject and purpose.
- Must be grounded in the article's opening or central thesis.
- No opinions, no filler phrases like "This article discusses...".

"keyPoints"
- Minimum 3, maximum 4 items.
- Each point must represent a DISTINCT insight from the article.
- No two points may overlap in meaning or content.
- Write each point as a standalone, self-explanatory statement.
- Do not use vague language such as "the article mentions" or "it talks about".
- Each point must be falsifiable — a reader should be able to verify it against the article.

"finalTakeaway"
- Exactly 1–2 sentences.
- Synthesize the article's overall conclusion or lesson.
- Must not simply restate a key point — it should provide a concluding perspective.

"suggestedQuestions"
- Exactly 3 questions.
- Every question MUST be answerable using ONLY the information in the article.
- Do not generate questions that require outside knowledge to answer.
- Questions must address different aspects of the article (do not cluster around one topic).
- Write questions as a curious reader would naturally phrase them.

═══════════════════════════════
QUALITY CHECKLIST (SELF-VERIFY BEFORE OUTPUTTING)
═══════════════════════════════
Before returning your response, verify:
[ ] mainIdea is 1–2 sentences and grounded in article content
[ ] keyPoints has 3–4 items with no overlap or repetition
[ ] finalTakeaway synthesizes — not just restates — the article
[ ] All 3 suggestedQuestions are answerable from the article alone
[ ] Output is a raw JSON object — no markdown, no extra text
[ ] JSON is valid and directly parseable by JSON.parse()

Return ONLY the JSON object. Begin your response with "{" and end with "}".
`;

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
