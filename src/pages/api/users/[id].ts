import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/user.model';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  switch (method) {
    case 'GET':
      try {
        const user = await User.findById(id).select('-password');
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
      } catch (error) {
        res.status(400).json({ success: false, error });
      }
      break;

    case 'PUT':
      try {
        const updates = { ...req.body };
        console.log('Received User Update Request for ID:', id);
        console.log('Payload:', JSON.stringify(updates, null, 2));
        
        // If there's a password update, hash it
        if (updates.password) {
          updates.password = await bcrypt.hash(updates.password, 10);
        }

        // Handle empty username
        if (updates.username === "") {
           if (updates.name) {
             updates.username = updates.name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(1000 + Math.random() * 9000);
           } else {
             delete updates.username;
           }
        }
        
        const user = await User.findByIdAndUpdate(id, updates, {
          new: true,
          runValidators: true
        }).select('-password');
        
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.status(200).json({ success: true, data: user });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const deletedUser = await User.findByIdAndDelete(id);
        
        if (!deletedUser) {
          return res.status(404).json({ success: false, message: 'User not found' });
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
}