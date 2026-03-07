import type { NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import { Contact } from '@/models/contact.model';
import authMiddleware, { AuthenticatedRequest } from '../middleware/auth';

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  if (method === 'POST') {
    try {
      const contact = await Contact.create(req.body);
      return res.status(201).json({ success: true, data: contact });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // Admin only methods (GET, PATCH, DELETE)
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
            const contacts = await Contact.find({}).sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: contacts });
          } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
          }
          break;

        case 'PATCH':
          try {
            const { id, status } = req.body;
            const contact = await Contact.findByIdAndUpdate(
              id,
              { status },
              { new: true, runValidators: true }
            );
            if (!contact) {
              return res.status(404).json({ success: false, message: 'Message not found' });
            }
            res.status(200).json({ success: true, data: contact });
          } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
          }
          break;

        case 'DELETE':
          try {
            const { id } = req.query;
            const deletedContact = await Contact.findByIdAndDelete(id);
            if (!deletedContact) {
              return res.status(404).json({ success: false, message: 'Message not found' });
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
