import type { NextApiRequest, NextApiResponse } from 'next';

import mongoose from 'mongoose';
import dbConnect from '@/lib/mongoose';
import { Blog } from '@/models/blog.model';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id, status },
    method,
  } = req;
  let query: any = {}
  if (status) {
    query.status = status
  }
  await dbConnect();


  switch (method) {
    case 'GET':
      try {
        const blog = await Blog.findOne({ ...query, url: id });

        if (!blog) {
          return res.status(200).json({ success: false, message: 'Blog not found' });
        }

        // Increment view count
        blog.views += 1;
        await blog.save();

        res.status(200).json({ success: true, data: blog });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const blog = await Blog.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true
        });

        if (!blog) {
          return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        res.status(200).json({ success: true, data: blog });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const deletedBlog = await Blog.findByIdAndDelete(id);

        if (!deletedBlog) {
          return res.status(404).json({ success: false, message: 'Blog not found' });
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