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

    roomWidthFeet: {
      type: Number,
      required: true,
    },

    roomHeightFeet: {
      type: Number,
      required: true,
    },

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

export const Design =
  models.Design || model("Design", DesignSchema);