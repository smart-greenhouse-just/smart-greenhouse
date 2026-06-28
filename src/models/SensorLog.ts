import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISensorLog extends Document {
  deviceId: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightIntensity: number;
  timestamp: Date;
}

const SensorLogSchema: Schema = new Schema(
  {
    deviceId: { type: String, required: true, index: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    soilMoisture: { type: Number, required: true },
    lightIntensity: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const SensorLog: Model<ISensorLog> =
  mongoose.models.SensorLog ||
  mongoose.model<ISensorLog>("SensorLog", SensorLogSchema);
