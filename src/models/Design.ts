import mongoose, { Schema, model, models } from "mongoose";

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
      type: [
        {
          id: String,
          x: Number,
          y: Number,
          width: Number,
          height: Number,
          fill: String,
          rotation: Number,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

if (models.Design) {
  const existingSchema = (models.Design as mongoose.Model<unknown>).schema;
  const hasRoomColorPaths =
    Boolean(existingSchema.path("wallColor")) &&
    Boolean(existingSchema.path("floorColor")) &&
    Boolean(existingSchema.path("roomShape")) &&
    Boolean(existingSchema.path("lightIntensity"));

  if (!hasRoomColorPaths) {
    delete models.Design;
  }
}

export const Design =
  (models.Design as mongoose.Model<unknown>) || model("Design", DesignSchema);
