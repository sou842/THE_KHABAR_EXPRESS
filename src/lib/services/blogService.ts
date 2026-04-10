import mongoose from 'mongoose';
import dbConnect from '../mongoose';
import { Blog } from '@/models/blog.model';

export interface BlogFilter {
  limit?: number;
  page?: number;
  category?: string;
  isApproved?: boolean;
  isTrending?: boolean;
  language?: string;
  tag?: string;
  authorId?: string;
  status?: string;
  search?: string;
  trending?: boolean | string;
}

export const getBlogs = async (filter: BlogFilter = {}) => {
  await dbConnect();

  const {
    limit = 10,
    page = 1,
    category,
    language,
    tag,
    authorId,
    status,
    search,
    trending
  } = filter;

  // Build query
  const query: any = {};
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }
  if (trending === 'true' || trending === true) query.isTrending = true;
  if (status) query.status = status;
  if (category) query.category = category;
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
    .select('-body')
    .populate('authorId', 'username');

  const total = await Blog.countDocuments(query);

  // Serialize Mongoose docs for Next.js props (critical for SSG)
  const serializedBlogs = JSON.parse(JSON.stringify(blogs));

  return {
    success: true,
    data: serializedBlogs,
    isValidCategory: !!blogs?.length,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  };
};
