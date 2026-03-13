import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import { Vault } from '@/models/vault.model';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';

export default withAuth(async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { id } = req.query;

  // Protect Admin Route
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }

  try {
    await dbConnect();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }

  switch (method) {
    case 'PUT':
      try {
        const updatedItem = await Vault.findByIdAndUpdate(
          id,
          { $set: req.body },
          { new: true, runValidators: true }
        ).populate('assignedTo', 'name email');

        if (!updatedItem) {
          return res.status(404).json({
            success: false,
            message: 'Vault item not found'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Vault item updated successfully',
          data: updatedItem
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error updating vault item',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

    case 'DELETE':
      try {
        const deletedItem = await Vault.findByIdAndDelete(id);

        if (!deletedItem) {
          return res.status(404).json({
            success: false,
            message: 'Vault item not found'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Vault item deleted successfully'
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error deleting vault item',
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
