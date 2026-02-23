import mongoose, { Schema, model, models } from "mongoose";

const FurnitureItemSchema = new Schema(
  {
    id: { type: String },
    // Keep legacy field name used by the editor payload.
    type: { type: String },
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number },
    heightFeet: { type: Number },
    shadeIntensity: { type: Number, min: 0, max: 1 },
    fill: { type: String },
    rotation: { type: Number },
    modelUrl: { type: String },
  },
  { _id: false }
);

const DesignSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "Untitled Design",
    },

    /* ROOM SPECIFICATIONS */
    roomWidthFeet: {
      type: Number,
      required: true,
    },

    roomHeightFeet: {
      type: Number,
      required: true,
    },

    roomLengthFeet: {
      type: Number,
    },

    wallHeightFeet: {
      type: Number,
      default: 9,
    },

    roomShape: {
      type: String,
      enum: ["rectangle", "square"], 
      default: "rectangle",
    },

    wallColor: {
      type: String,
      default: "#e2e8f0",
    },

    floorColor: {
      type: String,
      default: "#f3f4f6",
    },

    lightIntensity: {
      type: Number,
      default: 1,
      min: 0.2,
      max: 2,
    },

    /* FURNITURE */
    furniture: {
      type: [FurnitureItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Force recompilation in dev/HMR so stale schema versions do not persist.
if (models.Design) {
  delete models.Design;
}

export const Design =
  (models.Design as mongoose.Model<unknown>) || model("Design", DesignSchema);
