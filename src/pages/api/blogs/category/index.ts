import dbConnect from '@/lib/mongoose';
import { Category } from '@/models/category.model';
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
        const categories = await Category.find({});
        res.status(200).json({ success: true, data: categories });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        // Generate slug if not provided
        if (!req.body.slug && req.body.name) {
          req.body.slug = req.body.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }
        
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
      } catch (error: any) {
        if (error.code === 11000) {
          return res.status(400).json({ success: false, message: 'Category slug already exists' });
        }
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false, message: 'Invalid method' });
      break;
  }
}
