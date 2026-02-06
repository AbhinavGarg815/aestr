import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    googleSub: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["user", "contractor", "admin"],
      default: "user"
    },
    departmentCategory: { type: String },
    serviceArea: { type: String }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
