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
    const { limit = 20, sitemap } = req.query;
    const finalLimit = sitemap === 'true' ? 5000 : Number(limit);

    try {
      const tagsWithCounts = await Blog.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: finalLimit },
        { $project: { _id: 0, tag: '$_id', count: 1 } }
      ]);
      res.status(200).json({ success: true, data: tagsWithCounts });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(400).json({ success: false, message: 'Invalid method' });
  }
}
