import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongoose';
import { User } from '@/models/user.model';




export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  if (method !== 'POST') {
    return res.status(400).json({ success: false, message: 'Invalid method' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        access: user.access,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send response without password
    const userObj = user.toObject();
    const { password: _p, access: _a, createdAt: _c, status: _s, _id, ...userRest } = userObj;
    const userObject = { ...userRest, id: _id };

    res.status(200).json({
      success: true,
      user: userObject,
      token
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
}