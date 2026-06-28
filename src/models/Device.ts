import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDevice extends Document {
  deviceId: string;
  name: string;
  type: string;
  status: "online" | "offline";
  wifiStrength: number;
  ipAddress: string;
  lastSeen: Date;
}

const DeviceSchema: Schema = new Schema(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    type: { type: String, default: "esp32" },
    status: { type: String, enum: ["online", "offline"], default: "offline" },
    wifiStrength: { type: Number, default: 0 },
    ipAddress: { type: String, default: "" },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Device: Model<IDevice> =
  mongoose.models.Device || mongoose.model<IDevice>("Device", DeviceSchema);
