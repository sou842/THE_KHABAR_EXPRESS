import dbConnect from '@/lib/mongoose';
import { User } from '@/models/user.model';
import { Blog } from '@/models/blog.model';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { handle } = req.query;

  if (method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    // Find the user by username/handle OR _id
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(handle as string);
    const mongo = (await import('mongoose')).default;
    
    if (!mongo.connection.db) {
       await dbConnect();
    }
    
    const collection = mongo.connection.db!.collection('users');

    let user;
    if (isObjectId) {
      user = await collection.findOne({ 
        $or: [
          { username: handle }, 
          { _id: new mongo.Types.ObjectId(handle as string) }
        ] 
      });
    } else {
      user = await collection.findOne({ username: handle });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }

    // Explicitly exclude sensitive fields for security
    const { password, role, access, status, __v, ...publicUser } = user;

    res.status(200).json({
      success: true,
      data: publicUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
