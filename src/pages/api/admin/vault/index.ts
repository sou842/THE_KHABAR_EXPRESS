import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import { Vault } from '@/models/vault.model';
import { User } from '@/models/user.model';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';

export default withAuth(async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  // Protect Admin Route
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }

  try {
    await dbConnect();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  switch (method) {
    case 'GET':
      try {
        const { type } = req.query;
        let query = {};

        if (type) {
          query = { type };
        }

        const items = await Vault.find(query)
          .populate('assignedTo', 'name email')
          .sort({ createdAt: -1 });

        return res.status(200).json({
          success: true,
          data: items,
          count: items.length
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error retrieving vault items',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

    case 'POST':
      try {
        const { title, type, content, status, assignedTo, metadata } = req.body;

        if (!title || !content || !type) {
          return res.status(400).json({
            success: false,
            message: 'Title, type, and content are required fields'
          });
        }

        const newItem = await Vault.create({
          title,
          type,
          content,
          status: status || 'pending',
          assignedTo: assignedTo || [],
          metadata
        });

        await newItem.populate('assignedTo', 'name email');

        return res.status(201).json({
          success: true,
          message: 'Vault item created successfully',
          data: newItem
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error creating vault item',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

    default:
      return res.status(405).json({
        success: false,
        message: `Method ${method} not allowed`
      });
  }
});
