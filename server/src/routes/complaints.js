import express from "express";
import Complaint from "../models/Complaint.js";
import upload from "../middleware/upload.js";

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
    const { title, description, locationText, locationLat, locationLng, createdBy } = req.body;

    const complaint = await Complaint.create({
      title,
      description,
      locationText,
      locationLat: locationLat ? Number(locationLat) : undefined,
      locationLng: locationLng ? Number(locationLng) : undefined,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      createdBy: createdBy || undefined
    });

    res.status(201).json(complaint);
  } catch (error) {
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
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
        verificationImageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
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
