import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICapturedImage extends Document {
  deviceId: string;
  imageUrl: string;
  timestamp: Date;
}

const CapturedImageSchema: Schema = new Schema(
  {
    deviceId: { type: String, required: true, index: true },
    imageUrl: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const CapturedImage: Model<ICapturedImage> =
  mongoose.models.CapturedImage ||
  mongoose.model<ICapturedImage>("CapturedImage", CapturedImageSchema);
