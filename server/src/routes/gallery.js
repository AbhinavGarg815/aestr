import express from "express";
import { cloudinary } from "../config/cloudinary.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const max = Number(req.query.max) || 40;
    const maxResults = Math.min(Math.max(max, 1), 100);
    const rawFolder = process.env.CLOUDINARY_COMPLAINTS_FOLDER || "aestr/complaints";
    const folder = rawFolder.replace(/^\/+|\/+$/g, "");

    let result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: `${folder}/`,
      max_results: maxResults
    });

    if (!result.resources?.length && folder === "aestr/complaints") {
      result = await cloudinary.api.resources({
        type: "upload",
        resource_type: "image",
        prefix: "aester/complaints/",
        max_results: maxResults
      });
    }

    if (!result.resources?.length) {
      const searchResult = await cloudinary.search
        .expression(`public_id:${folder}/*`)
        .max_results(maxResults)
        .execute();
      result = { resources: searchResult.resources || [] };
    }

    const items = (result.resources || []).map((resource) => ({
      url: resource.secure_url,
      width: resource.width,
      height: resource.height,
      publicId: resource.public_id
    }));

    const totalCount = Number(result.total_count) || items.length;
    res.json({ items, totalCount });
  } catch (error) {
    console.error("Cloudinary fetch error:", error);
    next(error);
  }
});

export default router;