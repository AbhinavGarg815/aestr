import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import connectDb from "./config/db.js";
import complaintsRouter from "./routes/complaints.js";
import adminRouter from "./routes/admin.js";
import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadDir));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/complaints", complaintsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || "Server error" });
});

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server listening on ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

start();
