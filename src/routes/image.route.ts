import { Router } from "express";
import multer from "multer";
import {
  uploadImages,
  getAllImages,
  getOptimizedImage,
} from "../controllers/image.controller";
import { storage } from "../config/cloudinary";

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

const router = Router();

router.post("/upload", upload.any(), uploadImages);
router.get("/", getAllImages);
router.get("/:id/optimized", getOptimizedImage);

export default router;
