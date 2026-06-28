import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICameraAnalysis extends Document {
  imageId: string;
  status: "healthy" | "diseased" | "nutrient_deficiency" | "pest_detection";
  confidence: number;
  diagnoseResult: string;
  suggestedAction: string;
  timestamp: Date;
}

const CameraAnalysisSchema: Schema = new Schema(
  {
    imageId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["healthy", "diseased", "nutrient_deficiency", "pest_detection"],
      required: true,
    },
    confidence: { type: Number, required: true },
    diagnoseResult: { type: String, required: true },
    suggestedAction: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const CameraAnalysis: Model<ICameraAnalysis> =
  mongoose.models.CameraAnalysis ||
  mongoose.model<ICameraAnalysis>("CameraAnalysis", CameraAnalysisSchema);
