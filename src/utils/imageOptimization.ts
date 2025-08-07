import cloudinary from "../config/cloudinary";

export interface ResponsiveImageSizes {
  thumbnail: string; // 150x150
  small: string; // 400x300
  medium: string; // 800x600
  large: string; // 1200x900
  original: string; // Original optimized
}

/**
 * Generate responsive image variants from a Cloudinary public_id
 */
export const generateResponsiveImages = (
  publicId: string
): ResponsiveImageSizes => {
  const baseUrl = cloudinary.url(publicId, {
    secure: true,
    quality: "auto:good",
    fetch_format: "auto",
  });

  return {
    thumbnail: cloudinary.url(publicId, {
      width: 150,
      height: 150,
      crop: "fill",
      gravity: "auto",
      quality: "auto:good",
      fetch_format: "auto",
      secure: true,
    }),

    small: cloudinary.url(publicId, {
      width: 400,
      height: 300,
      crop: "limit",
      quality: "auto:good",
      fetch_format: "auto",
      secure: true,
    }),

    medium: cloudinary.url(publicId, {
      width: 800,
      height: 600,
      crop: "limit",
      quality: "auto:good",
      fetch_format: "auto",
      secure: true,
    }),

    large: cloudinary.url(publicId, {
      width: 1200,
      height: 900,
      crop: "limit",
      quality: "auto:eco",
      fetch_format: "auto",
      secure: true,
    }),

    original: baseUrl,
  };
};

/**
 * Get optimized image URL with custom transformations
 */
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    crop?: string;
    gravity?: string;
    format?: string;
  } = {}
): string => {
  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || "limit",
    gravity: options.gravity || "auto",
    quality: options.quality || "auto:good",
    fetch_format: options.format || "auto",
    secure: true,
    dpr: "auto",
  });
};

/**
 * Generate WebP and AVIF variants for modern browsers
 */
export const generateModernFormats = (publicId: string, width?: number) => {
  const baseOptions = {
    width: width || 1200,
    crop: "limit",
    quality: "auto:good",
    secure: true,
  };

  return {
    webp: cloudinary.url(publicId, { ...baseOptions, format: "webp" }),
    avif: cloudinary.url(publicId, { ...baseOptions, format: "avif" }),
    jpeg: cloudinary.url(publicId, { ...baseOptions, format: "jpg" }),
  };
};
