import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongoose';
import { Blog } from '@/models/blog.model';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  if (method === 'GET') {
    try {
      const tags = await Blog.distinct('tags');
      res.status(200).json({ success: true, data: tags.filter(Boolean) });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(400).json({ success: false, message: 'Invalid method' });
  }
}
