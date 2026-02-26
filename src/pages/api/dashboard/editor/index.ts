import dbConnect from "@/lib/mongoose";
import { Blog } from "@/models/blog.model";
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { withAuth } from "../../middleware/auth";

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { id } = req.query;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id as string)) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid user ID" });
        }

        // Number of blogs created by the user
        const totalUserBlogs = await Blog.countDocuments({ authorId: id });

        // Total views of all blogs created by the user
        const userTotalViews = await Blog.aggregate([
          { $match: { authorId: new mongoose.Types.ObjectId(id as string) } },
          { $group: { _id: null, totalViews: { $sum: "$views" } } },
        ]);

        // Number of user's blogs with different statuses
        const totalPendingUserBlogs = await Blog.countDocuments({
          authorId: id,
          status: "pending",
        });

        const totalApprovedUserBlogs = await Blog.countDocuments({
          authorId: id,
          status: "approved",
        });

        const totalRejectedUserBlogs = await Blog.countDocuments({
          authorId: id,
          status: "rejected",
        });

        res.status(200).json({
          success: true,
          data: {
            totalUserBlogs,
            totalViews: userTotalViews.length
              ? userTotalViews[0].totalViews
              : 0,
            totalPendingUserBlogs,
            totalApprovedUserBlogs,
            totalRejectedUserBlogs,
          },
        });
      } catch (error) {
        res
          .status(500)
          .json({ success: false, message: "Something went wrong", error });
      }
      break;

    default:
      res.status(400).json({ success: false, message: "Invalid method" });
      break;
  }
});
