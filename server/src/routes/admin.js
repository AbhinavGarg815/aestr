import express from "express";
import Complaint from "../models/Complaint.js";

const router = express.Router();

router.get("/analytics", async (req, res, next) => {
  try {
    const [total, open, assigned, resolved] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "open" }),
      Complaint.countDocuments({ status: "assigned" }),
      Complaint.countDocuments({ status: "resolved" })
    ]);

    res.json({
      total,
      open,
      assigned,
      resolved
    });
  } catch (error) {
    next(error);
  }
});

export default router;
