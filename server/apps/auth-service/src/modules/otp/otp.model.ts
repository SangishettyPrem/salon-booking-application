import mongoose, { Model, Document, Schema } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  isVerified: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTPModel: Model<IOtp> = mongoose.model<IOtp>("OTP", otpSchema);
