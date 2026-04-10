import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';

import dbConnect from '../../../lib/mongoose';
import { Blog } from '@/models/blog.model';
import { getBlogs } from '@/lib/services/blogService';

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
          limit,
          page,
          category,
          isApproved,
          language,
          tag,
          authorId,
          status,
          search,
          trending
        } = req.query;

        const result = await getBlogs({
          limit: limit ? Number(limit) : undefined,
          page: page ? Number(page) : undefined,
          category: category as string,
          language: language as string,
          tag: tag as string,
          authorId: authorId as string,
          status: status as string,
          search: search as string,
          trending: trending as string
        });

        res.status(200).json(result);
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
