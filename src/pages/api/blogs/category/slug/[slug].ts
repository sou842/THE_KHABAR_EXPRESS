import dbConnect from '@/lib/mongoose';
import { Category } from '@/models/category.model';
import type { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const {
        query: { slug },
        method,
    } = req;

    await dbConnect();

    if (method !== 'GET') {
        return res.status(400).json({ success: false, message: 'Invalid method' });
    }

    try {
        const category = await Category.findOne({ slug });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, data: category });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
}