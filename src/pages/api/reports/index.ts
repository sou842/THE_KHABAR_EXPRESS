import type { NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import { Report } from '@/models/report.model';
import { Blog } from '@/models/blog.model'; // Added Blog import for populate
import authMiddleware, { AuthenticatedRequest } from '../middleware/auth';

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  if (method === 'POST') {
    try {
      const { blogId, reason, details } = req.body;
      
      if (!blogId || !reason) {
        return res.status(400).json({ success: false, message: 'blogId and reason are required' });
      }

      const report = await Report.create({ blogId, reason, details });
      return res.status(201).json({ success: true, data: report });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // Admin only methods (GET)
  return new Promise<void>((resolve) => {
    authMiddleware(req, res, async () => {
      // Check if user is admin or editor
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'editor')) {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return resolve();
      }

      switch (method) {
        case 'GET':
          try {
            const reports = await Report.find({})
              .populate('blogId', 'title url')
              .sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: reports });
          } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
          }
          break;

        default:
          res.status(400).json({ success: false, message: 'Invalid method' });
          break;
      }
      resolve();
    });
  });
}
