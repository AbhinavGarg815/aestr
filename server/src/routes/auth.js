import dotenv from "dotenv";
import express from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

dotenv.config();

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyCredential = async (credential) => {
  if (!credential) {
    throw new Error("Google credential is required");
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload?.email || !payload?.name) {
    throw new Error("Invalid Google token payload");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name
  };
};

router.post("/google/signup", async (req, res, next) => {
  try {
    const { credential, role, departmentCategory, serviceArea } = req.body;

    if (!role || !["user", "contractor"].includes(role)) {
      return res.status(400).json({ message: "Role must be user or contractor" });
    }

    if (role === "contractor" && (!departmentCategory || !serviceArea)) {
      return res.status(400).json({
        message: "Contractor department category and service area are required"
      });
    }

    const { sub, email, name } = await verifyCredential(credential);
    const existing = await User.findOne({ $or: [{ googleSub: sub }, { email }] });
    if (existing) {
      return res.status(409).json({ message: "Account already exists" });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      googleSub: sub,
      role,
      departmentCategory: role === "contractor" ? departmentCategory : undefined,
      serviceArea: role === "contractor" ? serviceArea : undefined
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentCategory: user.departmentCategory,
      serviceArea: user.serviceArea
    });
  } catch (error) {
    next(error);
  }
});

router.post("/google/signin", async (req, res, next) => {
  try {
    const { credential } = req.body;
    const { sub, email } = await verifyCredential(credential);

    const user = await User.findOne({ $or: [{ googleSub: sub }, { email: email.toLowerCase() }] });
    if (!user) {
      return res.status(404).json({ message: "Account not found. Please sign up." });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentCategory: user.departmentCategory,
      serviceArea: user.serviceArea
    });
  } catch (error) {
    next(error);
  }
});

export default router;
