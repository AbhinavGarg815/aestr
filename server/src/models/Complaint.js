import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    locationText: { type: String, required: true },
    locationLat: { type: Number },
    locationLng: { type: Number },
    imageUrl: { type: String, required: true },
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
