import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/mongoose";
import { Blog } from "@/models/blog.model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const blogs = await Blog.find({ status: "approved" })
          .sort({ createdAt: -1 })
          .select("-body");

        res.status(200).json({
          success: true,
          data: blogs,
        });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false, message: "Invalid method" });
      break;
  }
}
