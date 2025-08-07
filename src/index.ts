import express, { type Application } from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import { config } from "dotenv";
import { connectDB } from "./config/database";
import imageRoutes from "./routes/image.route";

// Load environment variables (only loads .env if it exists)
config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.APP_ORIGIN
        : "http://localhost:5173",
    credentials: true,
  })
);
app.use(
  helmet({
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
    frameguard: {
      action: "deny",
    },
  })
);
app.use(compression());

app.use("/api/images", imageRoutes);

// Error handling middleware for Multer errors
app.use((error: any, req: any, res: any, next: any) => {
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "File too large. Maximum size is 10MB per file.",
    });
  }

  if (error.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      success: false,
      message: "Too many files. Maximum 10 files allowed.",
    });
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message:
        "Unexpected field name. Make sure your form field is named correctly.",
    });
  }

  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({
      success: false,
      message: "Only image files are allowed (jpg, png, jpeg, webp).",
    });
  }

  // Generic error handler
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});
