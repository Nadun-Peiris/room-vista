import mongoose, { Schema, models } from "mongoose";

const FurnitureSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    widthInches: {
      type: Number,
      required: true,
    },
    depthInches: {
      type: Number,
      required: true,
    },
    heightFeet: {
      type: Number,
      required: true,
    },
    modelUrl: {
      type: String, // Cloudinary GLB URL
      required: true,
    },
    thumbnailUrl: {
      type: String, // Cloudinary image URL
      required: true,
    },
  },
  { timestamps: true }
);

export const Furniture =
  models.Furniture || mongoose.model("Furniture", FurnitureSchema);