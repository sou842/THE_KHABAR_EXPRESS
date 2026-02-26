import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';

import dbConnect from '../../../lib/mongoose';
import { Blog } from '@/models/blog.model';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const {
          limit = 10,
          page = 1,
          category,
          isApproved,
          isTrending,
          language,
          tag,
          authorId,
          status,
          search,
          trending
        } = req.query;

        // Build query
        const query: any = {};
        if (search) {
          query.title = { $regex: search, $options: 'i' };
        }
        if (trending == 'true') query.isTrending = true;
        if (status) query.status = status;
        if (category) query.category = category;
        if (isApproved !== undefined) query.isApproved = isApproved === 'true';
        // if (isTrending !== undefined) query.isTrending = isTrending === 'true';
        if (language) query.language = language;
        if (tag) query.tags = { $in: [tag] };
        if (authorId && mongoose.Types.ObjectId.isValid(authorId as string)) {
          query.authorId = authorId;
        }

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);

        const blogs = await Blog.find(query)
          .sort({ createdAt: -1 })
          .limit(Number(limit))
          .skip(skip)
          .select('-body');

        const total = await Blog.countDocuments(query);

        // need send some description based on the category, sonu ???
        res.status(200).json({
          success: true,
          data: blogs,
          isValidCategory: !!blogs?.length,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const blog = await Blog.create(req.body);
        res.status(201).json({ success: true });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false, message: 'Invalid method' });
      break;
  }
}
