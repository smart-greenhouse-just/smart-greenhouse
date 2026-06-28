import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICommand extends Document {
  deviceId: string;
  command: string;
  payload: string;
  status: "pending" | "sent" | "executed" | "failed";
  errorMessage?: string;
  timestamp: Date;
  executedAt?: Date;
}

const CommandSchema: Schema = new Schema(
  {
    deviceId: { type: String, required: true, index: true },
    command: { type: String, required: true },
    payload: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "sent", "executed", "failed"],
      default: "pending",
    },
    errorMessage: { type: String },
    timestamp: { type: Date, default: Date.now },
    executedAt: { type: Date },
  },
  { timestamps: true }
);

export const Command: Model<ICommand> =
  mongoose.models.Command || mongoose.model<ICommand>("Command", CommandSchema);
