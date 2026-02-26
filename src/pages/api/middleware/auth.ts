import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

import { User } from '@/models/user.model';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: any;
}

export default async function authMiddleware(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token, access denied' });
    }
    
    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || '';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Find user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    // Add user to request
    req.user = user;
    
    // Continue
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

// Utility function to wrap API handlers with middleware
export function withAuth(handler: any) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve) => {
      authMiddleware(req, res, () => {
        resolve(handler(req, res));
      });
    });
  };
}