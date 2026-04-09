import dbConnect from "@/lib/mongoose";
import { Blog } from "@/models/blog.model";

type BlogQueryOptions = {
  limit?: number;
  page?: number;
  category?: string;
  status?: string;
  tag?: string;
  selectBody?: boolean;
  populateAuthor?: boolean;
};

type BlogPath = {
  url: string;
  updatedAt?: string;
};

type BlogTag = {
  tag: string;
  count: number;
};

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export async function getBlogs({
  limit = 10,
  page = 1,
  category,
  status,
  tag,
  selectBody = false,
  populateAuthor = false,
}: BlogQueryOptions = {}) {
  await dbConnect();

  const query: Record<string, unknown> = {};

  if (status) {
    query.status = status;
  }

  if (category) {
    query.category = category;
  }

  if (tag) {
    query.tags = { $in: [tag] };
  }

  const skip = (page - 1) * limit;
  let blogsQuery = Blog.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  if (!selectBody) {
    blogsQuery = blogsQuery.select("-body");
  }

  if (populateAuthor) {
    blogsQuery = blogsQuery.populate("authorId", "username");
  }

  const blogs = await blogsQuery.lean();
  return serialize(blogs);
}

export async function getBlogPaths(): Promise<BlogPath[]> {
  await dbConnect();

  const blogs = await Blog.find({ status: "approved" })
    .sort({ createdAt: -1 })
    .select("url updatedAt")
    .lean();

  return serialize(blogs);
}

export async function getBlogByUrl(url: string) {
  await dbConnect();

  const blog = await Blog.findOne({ url, status: "approved" })
    .populate("authorId", "username")
    .lean();

  return blog ? serialize(blog) : null;
}

export async function getRelatedBlogs({
  currentBlogId,
  primaryTag,
  category,
  limit = 4,
}: {
  currentBlogId: string;
  primaryTag?: string;
  category?: string;
  limit?: number;
}) {
  await dbConnect();

  const baseQuery = { status: "approved", _id: { $ne: currentBlogId } };

  let blogs: unknown[] = [];

  if (primaryTag) {
    blogs = await Blog.find({
      ...baseQuery,
      tags: { $in: [primaryTag] },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("-body")
      .lean();
  }

  if ((!blogs || blogs.length === 0) && category) {
    blogs = await Blog.find({
      ...baseQuery,
      category,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("-body")
      .lean();
  }

  return serialize(blogs);
}

export async function getBlogTags(limit = 5000): Promise<BlogTag[]> {
  await dbConnect();

  const tags = await Blog.aggregate([
    { $match: { status: "approved" } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { _id: 0, tag: "$_id", count: 1 } },
  ]);

  return serialize(tags);
}
