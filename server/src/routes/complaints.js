import express from "express";
import Complaint from "../models/Complaint.js";
import upload from "../middleware/upload.js";
import { uploadBuffer } from "../config/cloudinary.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json({ items: complaints });
  } catch (error) {
    next(error);
  }
});

router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const { description, locationText, locationLat, locationLng, createdBy } = req.body;
    if (!locationLat || !locationLng) {
      return res.status(400).json({ message: "Location is required" });
    }
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Image is required" });
    }

    const analyzerBase = process.env.ANALYZE_BASE_URL || "https://aesteralpha-475766520354.europe-west1.run.app";
    const analyzeUrl = `${analyzerBase.replace(/\/+$/, "")}/analyze-complete`;

    try {
      const form = new FormData();
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype || "application/octet-stream" });
      form.append("file", blob, req.file.originalname || "complaint");

      const analyzeResponse = await fetch(analyzeUrl, {
        method: "POST",
        body: form
      });

      if (!analyzeResponse.ok) {
        return res.status(502).json({ message: "Image analysis failed" });
      }

      const analysis = await analyzeResponse.json();
      const isValid = Boolean(analysis?.success) && Boolean(analysis?.civic_issue?.valid);
      if (!isValid) {
        return res.status(422).json({ message: "Invalid complaint image" });
      }

      req.analysisResult = analysis;
    } catch (analysisError) {
      return res.status(502).json({ message: "Image analysis failed" });
    }
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({ message: "Cloudinary is not configured" });
    }
    let imageUrl;

    const folder = process.env.CLOUDINARY_COMPLAINTS_FOLDER || "aestr/complaints";
    try {
      const uploaded = await uploadBuffer(req.file.buffer, {
        folder,
        resource_type: "image"
      });
      imageUrl = uploaded?.secure_url;
    } catch (uploadError) {
      return res.status(502).json({ message: uploadError.message || "Image upload failed" });
    }

    console.log("Uploaded image URL:", imageUrl);

    if (!imageUrl) {
      return res.status(502).json({ message: "Image upload failed" });
    }

    const severity = req.analysisResult?.civic_issue?.severity || "low";

    const complaint = await Complaint.create({
      description: description || "",
      locationText: locationText || "",
      locationLat: locationLat ? Number(locationLat) : undefined,
      locationLng: locationLng ? Number(locationLng) : undefined,
      imageUrl,
      severity,
      createdBy: createdBy || undefined
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error("Error creating complaint:", error);
    next(error);
  }
});

router.put("/:id/assign", async (req, res, next) => {
  try {
    const { authorityId } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo: authorityId, status: "assigned" },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (error) {
    next(error);
  }
});

router.put("/:id/resolve", upload.single("verificationImage"), async (req, res, next) => {
  try {
    let verificationImageUrl;

    if (req.file?.buffer) {
      try {
        const uploaded = await uploadBuffer(req.file.buffer, { folder: "aestr/verification" });
        verificationImageUrl = uploaded?.secure_url;
      } catch (uploadError) {
        return res.status(502).json({ message: "Verification upload failed" });
      }
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
        verificationImageUrl,
        resolvedAt: new Date()
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (error) {
    next(error);
  }
});

export default router;
