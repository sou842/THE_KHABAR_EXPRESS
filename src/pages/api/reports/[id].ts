import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import { Report } from '@/models/report.model';
import authMiddleware, { AuthenticatedRequest } from '../middleware/auth';

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { id } = req.query;

  await dbConnect();

  return new Promise<void>((resolve) => {
    authMiddleware(req, res, async () => {
      // Check if user is admin or editor
      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'editor')) {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return resolve();
      }

      switch (method) {
        case 'PATCH':
          try {
            const { status } = req.body;
            
            if (!['pending', 'reviewed', 'resolved'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }

            const report = await Report.findByIdAndUpdate(
              id,
              { status },
              { new: true, runValidators: true }
            );
            
            if (!report) {
              return res.status(404).json({ success: false, message: 'Report not found' });
            }
            
            res.status(200).json({ success: true, data: report });
          } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
          }
          break;

        case 'DELETE':
          try {
            const deletedReport = await Report.findByIdAndDelete(id);
            if (!deletedReport) {
              return res.status(404).json({ success: false, message: 'Report not found' });
            }
            res.status(200).json({ success: true, data: {} });
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
