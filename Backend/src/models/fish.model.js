import mongoose, { Schema } from "mongoose";

const fishSchema = new Schema(
  {
    imageUrl: {
      type: String,
      required: true, // Cloudinary or local path
    },
    predictedClass: {
      type: String,
      required: true, // e.g., 'rohu', 'catla'
    },
    confidence: {
      type: Number,
      required: false, // e.g., 0.95
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Connects fish to the user who uploaded it
    },
  },
  { timestamps: true }
);

export const Fish = mongoose.model("Fish", fishSchema);
