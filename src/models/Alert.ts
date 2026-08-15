import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAlert extends Document {
  deviceId: string;
  severity: "info" | "warning" | "critical";
  sensor: "temperature" | "humidity" | "soilMoisture" | "light" | "system";
  value?: number;
  message: string;
  suggestedAction?: string;
  dismissed: boolean;
  timestamp: Date;
}

const AlertSchema: Schema = new Schema(
  {
    deviceId: { type: String, required: true, index: true },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "warning",
    },
    sensor: {
      type: String,
      enum: [
        "temperature",
        "humidity",
        "soilMoisture",
        "light",
        "system",
      ],
      required: true,
    },
    value: { type: Number },
    message: { type: String, required: true },
    suggestedAction: { type: String },
    dismissed: { type: Boolean, default: false, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const Alert: Model<IAlert> =
  mongoose.models.Alert || mongoose.model<IAlert>("Alert", AlertSchema);
