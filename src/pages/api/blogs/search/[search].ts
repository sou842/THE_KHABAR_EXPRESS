import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

import dbConnect from "@/lib/mongoose";
import { Blog } from "@/models/blog.model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { search },
    method,
  } = req;

  await dbConnect();

  if (method !== "GET") {
    return res.status(400).json({ success: false, message: "Invalid method" });
  }

  try {
    if (typeof search === "string" && search.trim().length > 0) {
      const blogs = await Blog.aggregate([
        {
          $match: {
            status: { $nin: ["pending", "rejected"] }, 
            $or: [
              { createdBy: { $regex: search, $options: "i" } },
              { title: { $regex: search, $options: "i" } },
              { tags: { $elemMatch: { $regex: search, $options: "i" } } },
              { category: { $regex: search, $options: "i" } },
              {
                body: {
                  $elemMatch: {
                    $or: [
                      { "data.text": { $regex: search, $options: "i" } },
                      { "data.caption": { $regex: search, $options: "i" } },
                      { "data.code": { $regex: search, $options: "i" } },
                      { "data.html": { $regex: search, $options: "i" } },
                    ],
                  },
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $project: {
            "thumbnail.title": 1,
            "thumbnail.description": 1,
            "thumbnail.image": 1,
            tags: 1,
            category: 1,
            author: 1,
            views: 1,
            videoUrl: 1,
            language: 1,
            url: 1,
            updatedAt: 1,
            createdAt: 1,
          },
        },
        { $limit: 10 },
      ]);

      return res.status(200).json({ success: true, data: blogs });
    }

    res
      .status(400)
      .json({ success: false, message: "Search query is required" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
