import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import { BlogChunk } from '@/models/blogChunk.model';
import { Blog } from '@/models/blog.model';
import { generateEmbeddings, askAi, processBlogForRag } from '@/lib/ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { blogId, question, history } = req.body;

  if (!blogId || !question) {
    return res.status(400).json({ success: false, message: 'Blog ID and question are required' });
  }

  try {
    await dbConnect();

    // 1. Generate embedding for the question
    const questionEmbedding = await generateEmbeddings(question);

    // 2. Search for relevant chunks using MongoDB Vector Search
    // Note: This requires a vector index named 'vector_index' on BlogChunk collection
    // with 'embedding' field having 768 dimensions (Gemini text-embedding-004)
    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index", 
          path: "embedding",
          queryVector: questionEmbedding,
          numCandidates: 100,
          limit: 5,
        },
      },
      {
        $match: { blogId: blogId } // Stay within this blog post
      },
      {
        $project: {
          content: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ];

    // Note: If vectorSearch is not available (e.g. local dev without Atlas), 
    // we fallback to just getting first few chunks for now or inform user.
    let relevantChunks;
    try {
      relevantChunks = await (BlogChunk as any).aggregate(pipeline);
    } catch (err) {
      console.warn("Vector Search failed, falling back to manual search", err);
      relevantChunks = await BlogChunk.find({ blogId }).limit(3);
    }

    if (!relevantChunks || relevantChunks.length === 0) {
      // 2a. Dynamic processing: If no chunks, try to find the blog and process it now
      const blog = await Blog.findById(blogId);
      if (blog && blog.body) {
        const contentText = blog.body
          .map((block: any) => {
            if (block.type === 'paragraph') return block.data.text;
            if (block.type === 'header') return block.data.text;
            if (block.type === 'list') return block.data.items?.join(' ');
            if (block.type === 'quote') return block.data.text;
            return '';
          })
          .join('\n\n')
          .replace(/<[^>]*>?/gm, '');

        if (contentText.length > 100) {
          console.log(`DEBUG: Dynamically processing blog ${blogId} for Q&A`);
          await processBlogForRag(blogId, contentText);
          
          // Retry search once after processing
          relevantChunks = await BlogChunk.find({ blogId }).limit(5);
        }
      }

      if (!relevantChunks || relevantChunks.length === 0) {
        return res.status(200).json({ 
          success: true, 
          answer: "I'm still analyzing this article. Please give me a few seconds to finish processing and try asking again!" 
        });
      }
    }

    const context = relevantChunks.map((c: any) => c.content).join('\n\n---\n\n');

    // 3. Generate answer via Gemini
    const answer = await askAi(question, context, history);

    return res.status(200).json({ 
      success: true, 
      answer,
      references: relevantChunks.slice(0, 2).map((c: any) => c.content)
    });
  } catch (error: any) {
    console.error("API Error (Ask):", error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
}
