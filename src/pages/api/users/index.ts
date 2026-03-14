import dbConnect from '@/lib/mongoose';
import { User } from '@/models/user.model';
import bcrypt from 'bcryptjs';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const users = await User.find({}).select('-password');
        res.status(200).json({ success: true, data: users });
      } catch (error) {
        res.status(400).json({ success: false, error });
      }
      break;

    case 'POST':
      try {
        // Hash password
        const { password, ...rest } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Auto-generate username if not provided
        if (!rest.username && rest.name) {
          rest.username = rest.name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(1000 + Math.random() * 9000);
        } else if (rest.username === "") {
           delete rest.username;
        }

        const user = await User.create({
          ...rest,
          password: hashedPassword
        });
        
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.status(201).json({ success: true, data: userResponse });
      } catch (error: any) {
        if (error.code === 11000) {
          return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false, message: 'Invalid method' });
      break;
  }
}