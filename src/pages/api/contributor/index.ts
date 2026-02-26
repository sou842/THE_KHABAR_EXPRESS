import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "../../../lib/mongoose";
import { Contributor } from "@/models/contributor.model";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { id } = req.query;
        let contributor;

        if (!id) {
          contributor = await Contributor.find();
        } else {
          // Validate ObjectId
          if (!mongoose.Types.ObjectId.isValid(id as string)) {
            return res
              .status(400)
              .json({ success: false, message: "Invalid blog ID" });
          }

          contributor = await Contributor.findById(id);
        }

        if (!contributor) {
          return res
            .status(404)
            .json({ success: false, message: "Contributor not found" });
        }

        res.status(200).json({ success: true, data: contributor });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "POST":
      try {
        const contributor = await Contributor.create(req.body);
        res.status(201).json({ success: true, data: contributor });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false, message: "Invalid method" });
      break;
  }
}
