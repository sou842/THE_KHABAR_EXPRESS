import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import { Blog } from '@/models/blog.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    await dbConnect();

    switch (method) {
        case 'GET':
            try {
                const {
                    status,
                    page = 1,
                    limit = 5,
                    search = '',
                    sort = 'desc',
                } = req.query;

                if (!['pending', 'approved', 'rejected'].includes(status as string)) {
                    return res.status(400).json({ success: false, message: 'Invalid status value' });
                }

                const filter: any = {
                    status,
                    ...(search && {
                        $or: [
                            { title: { $regex: search, $options: 'i' } },
                            { author: { $regex: search, $options: 'i' } },
                        ]
                    })
                };

                const blogs = await Blog.find(filter)
                    .sort({ createdAt: sort === 'asc' ? 1 : -1 })
                    .limit(Number(limit))
                    .skip((Number(page) - 1) * Number(limit))
                    .select('-body');

                const total = await Blog.countDocuments(filter);

                return res.status(200).json({
                    success: true,
                    data: blogs,
                    totalPages: Math.ceil(total / Number(limit)),
                    totalItems: total,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                    },
                });
            } catch (error: any) {
                return res.status(400).json({ success: false, error: error.message });
            }

        default:
            return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}
