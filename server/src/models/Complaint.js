import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    description: { type: String },
    locationText: { type: String },
    locationLat: { type: Number },
    locationLng: { type: Number },
    imageUrl: { type: String, required: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low"
    },
    status: {
      type: String,
      enum: ["open", "assigned", "resolved"],
      default: "open"
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verificationImageUrl: { type: String },
    resolvedAt: { type: Date }
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
