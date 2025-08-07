import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
process.loadEnvFile();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "my-images",
      allowed_formats: ["jpg", "png", "jpeg", "webp", "avif"],
      format: "auto", // Automatically choose the best format (WebP, AVIF, etc.)
      transformation: [
        {
          // Universal optimizations for all images
          width: 1200, // Max width to keep files reasonable
          crop: "limit", // Don't upscale smaller images
          quality: "auto:good", // Smart quality optimization based on content
          fetch_format: "auto", // Automatically choose best format (WebP, AVIF, etc.)
          flags: ["progressive", "immutable_cache"], // Progressive loading + cache optimization
          dpr: "auto", // Automatic device pixel ratio adjustment for retina displays
        },
      ],
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,

      // Additional optimization options
      resource_type: "image",
      use_filename: false,
      unique_filename: true,
      overwrite: false,
    };
  },
});

export default cloudinary;
