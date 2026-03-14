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
    // 1. Find the user by username/handle OR _id
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(handle as string);
    const userQuery = isObjectId 
      ? { $or: [{ username: handle }, { _id: handle }] }
      : { username: handle };

    const user = await User.findOne(userQuery).select('_id');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }

    // 2. Fetch published blogs for this creator
    const blogs = await Blog.find({ 
      authorId: user._id,
      status: 'approved'
    })
    .sort({ createdAt: -1 })
    .select('-body -__v') // Exclude body as requested
    .limit(5);

    res.status(200).json({
      success: true,
      data: blogs
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
