import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  avatarUrl: string;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: {
      type: String,
      enum: ["admin", "operator", "viewer"],
      default: "operator",
    },
    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
