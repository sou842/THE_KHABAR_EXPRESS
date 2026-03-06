const PRIMARY_MODEL = "stepfun/step-3.5-flash:free";
const FALLBACK_MODELS = [
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "nvidia/nemotron-nano-9b-v2:free",
];

export interface AiSummary {
  mainIdea: string;
  keyPoints: string[];
  finalTakeaway: string;
  suggestedQuestions: string[];
}

const callOpenRouter = async (prompt: string, jsonMode: boolean = false) => {
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError = "No models available";

  for (const model of modelsToTry) {
    try {
      console.log(`DEBUG: AI [${model}] - Attempting...`);
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://thekhabarexpress.com",
          "X-Title": "The Khabar Express",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": model,
          "messages": [{ "role": "user", "content": prompt }]
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.warn(`DEBUG: AI [${model}] - Failed to parse JSON response`);
        lastError = "Invalid JSON response";
        continue;
      }

      if (response.status === 429 || data?.error?.code === 429) {
        console.warn(`DEBUG: AI [${model}] - Rate limited (429). Trying next...`);
        lastError = "Rate limited";
        continue;
      }

      if (!response.ok) {
        console.error(`DEBUG: AI [${model}] - Error:`, JSON.stringify(data?.error || data, null, 2));
        lastError = data?.error?.message || `HTTP ${response.status}`;
        continue;
      }

      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        console.warn(`DEBUG: AI [${model}] - Empty content received.`);
        lastError = "Empty content";
        continue;
      }

      console.log(`DEBUG: AI [${model}] - Success!`);
      return content;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`DEBUG: AI [${model}] - Exceptional Error:`, msg);
      lastError = msg;
      continue;
    }
  }

  throw new Error(`AI Provider exhausted all models. Last error: ${lastError}`);
};

export const generateSummary = async (content: string): Promise<AiSummary> => {
  const prompt = `
You are an expert content analyst and summarization AI.

Your task is to analyze the following blog post and generate a clear, accurate, and structured summary.

IMPORTANT RULES

1. Use **only the provided content** as your source of information.
2. Do **not invent or assume information** that is not present in the article.
3. Keep the summary **clear, concise, and informative**.
4. Extract the **most important insights and ideas** from the article.
5. Avoid generic or vague statements.
6. If the article contains technical concepts, explain the key ideas in a simplified and readable way.
7. Your output must follow the **exact JSON structure provided below**.
8. The output must contain **valid JSON only** — no extra text, markdown, comments, or explanations.
9. Ensure the JSON can be parsed directly using \`JSON.parse()\`.

Content to analyze:
${content}

Your output must follow this structure exactly:

{
"mainIdea": "A concise explanation of the primary idea or purpose of the article. Maximum 2 sentences.",
"keyPoints": [
"Important takeaway or insight from the article",
"Another key concept explained in the article",
"Additional relevant insight",
"Optional fourth key point if needed"
],
"finalTakeaway": "A brief concluding insight that captures the overall message or lesson of the article.",
"suggestedQuestions": [
"Question 1",
"Question 2",
"Question 3"
]
}

FIELD GUIDELINES

mainIdea

* Provide a short explanation of the article's main purpose or theme.
* Maximum 2 sentences.

keyPoints

* Extract the most important ideas from the article.
* Each point should represent a meaningful insight from the article.
* Avoid repeating the same idea in different wording.

finalTakeaway

* Provide a concise concluding insight or overall lesson from the article.

suggestedQuestions

* Generate 3 thoughtful questions that a reader might naturally ask after reading the article.
* **Every question must be answerable using the information contained in the article.**
* Do not create questions that require external knowledge.
* The questions should help users explore the key ideas, explanations, or conclusions from the article.

Return **only the JSON object**.
Do not include any explanations, markdown formatting, or additional text.
`;

  const text = await callOpenRouter(prompt, true);
  
  try {
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
    return JSON.parse(jsonStr) as AiSummary;
  } catch (error) {
    console.error("Error parsing AI summary:", error);
    // Return a fallback structure if parsing fails but we have text
    return {
      mainIdea: "Failed to parse AI summary. The content was generated but not in the expected format.",
      keyPoints: ["Please check the console for details"],
      finalTakeaway: "Retry requested",
      suggestedQuestions: ["Can you explain the main idea again?", "What are the key takeaways?"]
    };
  }
};

export const generateEmbeddings = async (text: string): Promise<number[]> => {
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "openai/text-embedding-3-small", 
        "input": text
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn("Embedding failed. Using dummy embedding as fallback.", data);
      return new Array(1536).fill(0); 
    }
    return data.data[0].embedding;
  } catch (err) {
    console.error("Embedding service unavailable:", err);
    return new Array(1536).fill(0);
  }
};

export const chunkText = (text: string, chunkSize: number = 1000, overlap: number = 200): string[] => {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    if (endIndex > text.length) {
      endIndex = text.length;
    } else {
      const lastPeriod = text.lastIndexOf(".", endIndex);
      const lastNewline = text.lastIndexOf("\n", endIndex);
      const splitPoint = Math.max(lastPeriod, lastNewline);
      
      if (splitPoint > startIndex + chunkSize * 0.5) {
        endIndex = splitPoint + 1;
      }
    }

    chunks.push(text.substring(startIndex, endIndex).trim());
    startIndex = endIndex - overlap;
    
    if (startIndex >= text.length || endIndex >= text.length) break;
  }

  return chunks.filter(c => c.length > 50);
};


export const askAi = async (question: string, context: string, conversationHistory: string = ""): Promise<string> => {
  const prompt = `
You are an intelligent AI assistant integrated inside a blogging platform.

Your job is to help users understand an article and answer their questions in a clear, friendly, and conversational way.

You will receive three types of information:

1. ARTICLE CONTEXT
   Relevant sections extracted from the blog article.

2. CONVERSATION HISTORY
   Previous messages between the user and the assistant.

3. USER QUESTION
   The latest message from the user.

Use all of this information to generate your response.

---

PRIMARY RESPONSIBILITIES

1. Help users understand the article.
2. Answer questions using the provided article context.
3. Maintain a natural conversation with the user.
4. Use the conversation history to understand follow-up questions.
5. Provide helpful explanations when the user asks for clarification.

---

IMPORTANT RULES

1. Base your answers **primarily on the provided article context**.
2. If the answer is not present in the article context, respond with:

"I'm sorry, but this article doesn't contain information about that."

3. Do NOT invent facts that are not supported by the article.
4. Do NOT hallucinate information.
5. Keep answers **clear, concise, and easy to understand**.
6. If the user asks a follow-up question, use the **conversation history** to understand what they mean.
7. Users may ask questions in casual or imperfect language — interpret their intent and respond helpfully.

---

WEBSITE / PLATFORM QUESTIONS

If the user asks questions about the platform itself (for example about features, blogging, publishing, accounts, or how the site works), you may answer those questions normally using general knowledge about blogging platforms.

Examples:

* "How can I publish my own blog?"
* "Can I comment on posts?"
* "How do I follow a writer?"

In these cases, provide a helpful explanation about how a typical blogging platform works.

However, do not invent specific platform policies or features if you are not certain.

---

HANDLING USER LANGUAGE

Users may ask questions in many ways, including:

* informal language
* incomplete sentences
* follow-up questions
* conversational messages

Examples:
"What does this mean?"
"Explain that part again"
"Why is this important?"
"Can you simplify this?"

Use the article context and conversation history to understand what the user is referring to.

---

RESPONSE STYLE

Your answers should:

• Be clear and conversational
• Be easy for normal readers to understand
• Focus on explaining the article content
• Avoid overly technical language unless necessary

If appropriate, you may reference ideas from the article like:

"The article explains that..."

or

"According to the article..."

---

CONTEXT

Article Context:
${context}

Conversation History:
${conversationHistory}

User Question:
${question}

---

Now generate a helpful answer for the user based on the instructions above.
`;

  return await callOpenRouter(prompt);
};

/**
 * Shared logic to process a blog post: chunk it and store embeddings in DB.
 * This is called by summary generation OR Q&A if chunks are missing.
 */
import { BlogChunk } from '@/models/blogChunk.model';

export async function processBlogForRag(blogId: string, text: string) {
  // Check if chunks already exist to avoid redundant work
  const existingChunks = await BlogChunk.countDocuments({ blogId });
  if (existingChunks > 0) {
    console.log(`DEBUG: Chunks already exist for blog ${blogId}. Skipping.`);
    return;
  }

  console.log(`DEBUG: Processing blog ${blogId} for RAG...`);
  const chunks = chunkText(text);
  
  // Use a smaller batch size to avoid hitting rate limits or timeouts
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const embedding = await generateEmbeddings(chunk);
      
      await BlogChunk.create({
        blogId,
        content: chunk,
        embedding,
        index: i
      });
    } catch (err) {
      console.error(`DEBUG: Failed to process chunk ${i} for blog ${blogId}:`, err);
    }
  }
}
