import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import ImageModel from "../models/image.model";
import { generateResponsiveImages } from "../utils/imageOptimization";

export const uploadImages = async (req: Request, res: Response) => {
  try {
    // Validate uploaded files
    const files = req.files as Express.Multer.File[];
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No images uploaded. Please include image files in your request.",
      });
    }

    // Process each file to get optimization data and generate responsive variants
    const imageDocs = await Promise.all(
      files.map(async (file) => {
        try {
          // Get image details from Cloudinary
          const result = await cloudinary.api.resource(file.filename);

          // Generate responsive image URLs
          const responsiveUrls = generateResponsiveImages(file.filename);

          return {
            url: file.path, // Original optimized URL from multer-storage-cloudinary
            publicId: file.filename,
            originalName: file.originalname,
            size: file.size, // Original file size
            responsiveUrls,
            dimensions: {
              width: result.width,
              height: result.height,
            },
            format: result.format,
            optimizedSize: result.bytes, // Size after Cloudinary optimization
          };
        } catch (error) {
          console.error(`Error processing file ${file.originalname}:`, error);
          // Fallback without detailed info
          return {
            url: file.path,
            publicId: file.filename,
            originalName: file.originalname,
            size: file.size,
            responsiveUrls: generateResponsiveImages(file.filename),
          };
        }
      })
    );

    // Insert all images in a single operation for efficiency
    const savedImages = await ImageModel.insertMany(imageDocs);

    // Prepare response data with optimization info
    const responseData = savedImages.map((img) => ({
      _id: img._id,
      url: img.url,
      publicId: img.publicId,
      originalName: img.originalName,
      size: img.size,
      optimizedSize: img.optimizedSize,
      dimensions: img.dimensions,
      format: img.format,
      responsiveUrls: img.responsiveUrls,
      // Include savings information
      compressionRatio:
        img.size && img.optimizedSize
          ? Math.round(((img.size - img.optimizedSize) / img.size) * 100)
          : null,
    }));

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${responseData.length} image(s)`,
      data: responseData,
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Handle specific Multer errors
    if (error instanceof Error) {
      if (error.message.includes("File too large")) {
        return res.status(413).json({
          success: false,
          message: "File too large. Maximum size is 10MB per file.",
        });
      }
      if (error.message.includes("Only image files")) {
        return res.status(400).json({
          success: false,
          message: "Only image files are allowed (jpg, png, jpeg, webp).",
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Server error during file upload. Please try again.",
    });
  }
};

export const getAllImages = async (req: Request, res: Response) => {
  try {
    const images = await ImageModel.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: images,
      count: images.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getOptimizedImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      width,
      height,
      quality = "auto:good",
      format = "auto",
      size = "medium",
    } = req.query;

    const image = await ImageModel.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    let optimizedUrl: string;

    // If specific dimensions provided, generate custom URL
    if (width || height) {
      optimizedUrl = cloudinary.url(image.publicId, {
        width: width ? parseInt(width as string) : undefined,
        height: height ? parseInt(height as string) : undefined,
        crop: "limit",
        quality: quality as string,
        fetch_format: format as string,
        secure: true,
        dpr: "auto",
      });
    } else {
      // Use predefined responsive size
      const sizeKey = size as keyof typeof image.responsiveUrls;
      optimizedUrl = image.responsiveUrls?.[sizeKey] || image.url;
    }

    res.json({
      success: true,
      data: {
        _id: image._id,
        originalName: image.originalName,
        optimizedUrl,
        dimensions: image.dimensions,
        format: image.format,
        responsiveUrls: image.responsiveUrls,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
