import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDb from "./config/db.js";
import complaintsRouter from "./routes/complaints.js";
import adminRouter from "./routes/admin.js";
import authRouter from "./routes/auth.js";
import galleryRouter from "./routes/gallery.js";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "https://aestr-anawcbeef9czg5c4.centralindia-01.azurewebsites.net" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/complaints", complaintsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/gallery", galleryRouter);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || "Server error" });
});

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
      console.log(`Server listening on ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

start();
