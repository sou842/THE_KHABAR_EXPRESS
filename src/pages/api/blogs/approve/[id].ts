import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';

import dbConnect from '@/lib/mongoose';
import { User } from '@/models/user.model';
import { Blog } from '@/models/blog.model';
import { withAuth } from '../../middleware/auth';

export default withAuth(async function (
  req: NextApiRequest & any,
  res: NextApiResponse
) {
  const {
    query: { id },
    method,
    body: { status }
  } = req;
  await dbConnect();
  const userId = req?.user?.id
  
  // Only allow PUT method for approval
  if (method !== 'PUT') {
    return res.status(400).json({ success: false, message: 'Invalid method' });
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ success: false, message: 'Invalid blog ID' });
  }

  // Check if user has approval rights
  if (!userId || !mongoose.Types.ObjectId.isValid(userId as string)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'admin' && !user.access.canApprove) {
      return res.status(403).json({ success: false, message: 'User does not have approval rights' });
    }

    const blog = await Blog.findByIdAndUpdate(id,
      { publishedDate: new Date(), status },

    );

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
})