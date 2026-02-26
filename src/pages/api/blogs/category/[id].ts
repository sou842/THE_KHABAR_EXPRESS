import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';

import dbConnect from '@/lib/mongoose';
import { Category } from '@/models/category.model';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const {
        query: { id },
        method,
    } = req;

    await dbConnect();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }

    switch (method) {
        case 'GET':
            try {
                const category = await Category.findById(id);

                if (!category) {
                    return res.status(404).json({ success: false, message: 'Category not found' });
                }

                res.status(200).json({ success: true, data: category });
            } catch (error: any) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;

        case 'PUT':
            try {
                const updates = { ...req.body };

                // Generate slug if name is changed but slug is not provided
                if (updates.name && !updates.slug) {
                    updates.slug = updates.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                }

                const category = await Category.findByIdAndUpdate(id, updates, {
                    new: true,
                    runValidators: true
                });

                if (!category) {
                    return res.status(404).json({ success: false, message: 'Category not found' });
                }

                res.status(200).json({ success: true, data: category });
            } catch (error: any) {
                if (error.code === 11000) {
                    return res.status(400).json({ success: false, message: 'Category slug already exists' });
                }
                res.status(400).json({ success: false, error: error.message });
            }
            break;

        case 'DELETE':
            try {
                const deletedCategory = await Category.findByIdAndDelete(id);

                if (!deletedCategory) {
                    return res.status(404).json({ success: false, message: 'Category not found' });
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
