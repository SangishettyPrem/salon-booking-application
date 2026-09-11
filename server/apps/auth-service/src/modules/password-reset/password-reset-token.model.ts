import { Schema, type Types } from "mongoose";
import mongoose, { Model, Document } from "mongoose";

export interface IPasswordResetToken extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Automatically remove expired reset tokens.
passwordResetTokenSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
  },
);

export const PasswordResetTokenModel: Model<IPasswordResetToken> =
  mongoose.model<IPasswordResetToken>(
    "PasswordResetToken",
    passwordResetTokenSchema,
  );
