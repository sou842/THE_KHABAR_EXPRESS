import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import { Blog } from '@/models/blog.model';
import { BlogChunk } from '@/models/blogChunk.model';
import { generateSummary, processBlogForRag } from '@/lib/ai';

export const maxDuration = 60; // Max allowed for Vercel Hobby plan

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { blogId } = req.body;

  if (!blogId) {
    return res.status(400).json({ success: false, message: 'Blog ID is required' });
  }

  try {
    await dbConnect();

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // 1. Return cached summary if it exists
    if (blog.aiSummary && blog.aiSummary.mainIdea) {
      return res.status(200).json({ success: true, data: blog.aiSummary });
    }

    // 2. Otherwise, generate it
    // Extract text from Editor.js blocks
    const contentText = blog.body
      .map((block: any) => {
        if (block.type === 'paragraph') return block.data.text;
        if (block.type === 'header') return block.data.text;
        if (block.type === 'list') return block.data.items?.join(' ');
        if (block.type === 'quote') return block.data.text;
        return '';
      })
      .join('\n\n')
      .replace(/<[^>]*>?/gm, ''); // Remove HTML tags if any

    const summary = await generateSummary(contentText);

    // Store summary
    blog.aiSummary = summary;
    await blog.save();

    // 3. Trigger background processing for RAG (chunks and embeddings)
    return res.status(200).json({ success: true, data: summary });
  } catch (error: any) {
    console.error("API Error (Summary):", error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
}
