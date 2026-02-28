import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '../../../lib/mongoose';
import { Blog } from '@/models/blog.model';

// In-memory store for rate limiting
// For a production app with multiple instances, you'd want to use Redis instead.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 100; // max 100 requests per hour per IP

function applyRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (now > record.resetTime) {
    // Window expired, reset
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  record.count += 1;
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // 1. Check IP and apply rate limiting
  // Note: If you are behind a proxy like Vercel or Cloudflare, use req.headers['x-forwarded-for']
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const isAllowed = applyRateLimit(ip);

  if (!isAllowed) {
    return res.status(429).json({ 
      success: false, 
      message: 'Too Many Requests. Please try again later.' 
    });
  }

  // 2. Validate the Static Token
  // You should set this in your .env file: EXTERNAL_API_SECRET_TOKEN=your_super_secret_string
  const expectedToken = process.env.EXTERNAL_API_SECRET_TOKEN || 'fallback_development_token_change_me';
  
  // Can be sent in headers as 'x-api-token' or Authorization Bearer, or query params.
  const providedToken = req.headers['x-api-token'] || req.query.token;

  if (!providedToken || providedToken !== expectedToken) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Invalid or missing token.' });
  }

  // 3. Connect to DB and insert the blog
  try {
    await dbConnect();

    const blogData = req.body;

    // Force certain fields to ensure security and proper review workflow
    const newBlog = await Blog.create({
      ...blogData,
      status: 'pending', // Force draft/pending status so admin must approve
      isTrending: false, // Don't allow them to auto-trend
      // If authorId is not provided, we can either throw an error or use a system placeholder if your schema allows
    });

    res.status(201).json({ 
      success: true, 
      message: 'Blog successfully ingested and is pending approval.',
      data: { id: newBlog._id }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}
