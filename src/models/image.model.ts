import { Schema, model, Document } from "mongoose";

interface ResponsiveUrls {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
}

interface IImage extends Document {
  url: string;
  publicId: string;
  originalName?: string;
  size?: number;
  responsiveUrls?: ResponsiveUrls;
  dimensions?: {
    width: number;
    height: number;
  };
  format?: string;
  optimizedSize?: number; // Size after Cloudinary optimization
}

const imageSchema = new Schema<IImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    originalName: { type: String },
    size: { type: Number },
    responsiveUrls: {
      thumbnail: { type: String },
      small: { type: String },
      medium: { type: String },
      large: { type: String },
      original: { type: String },
    },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
    },
    format: { type: String },
    optimizedSize: { type: Number },
  },
  { timestamps: true }
);

export default model<IImage>("Image", imageSchema);
