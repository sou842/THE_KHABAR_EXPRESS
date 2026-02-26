import dbConnect from '@/lib/mongoose';
import { User } from '@/models/user.model';
import { Blog } from '@/models/blog.model';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../middleware/auth';

export default withAuth(async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req;

    await dbConnect();

    switch (method) {
        case 'GET':
            try {
                // Total views across all blogs
                const totalViews = await Blog.aggregate([
                    { $group: { _id: null, totalViews: { $sum: "$views" } } }
                ]);
                
                // Total pending blogs
                const totalPendingBlogs = await Blog.countDocuments({ status: 'pending' });

                // Total editors
                const totalEditors = await User.countDocuments({ role: 'editor' });

                // Total blogs
                const totalBlogs = await Blog.countDocuments();

                res.status(200).json({
                    success: true,
                    data: {
                        totalViews: totalViews.length ? totalViews[0].totalViews : 0,
                        totalPendingBlogs,
                        totalEditors,
                        totalBlogs
                    }
                });
            } catch (error) {
                res.status(500).json({ success: false, message: 'Something went wrong', error });
            }
            break;

        default:
            res.status(400).json({ success: false, message: 'Invalid method' });
            break;
    }
});
