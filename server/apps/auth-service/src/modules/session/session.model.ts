import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  userAgent: string;
  ip: string;
  refreshTokenHash: string;
  isRevoked: boolean;
  revokedAt: Date;
  expiresAt: Date;
}

export interface ISessionMethods {
  compareRefreshToken(refreshToken: string): Promise<boolean>;
}

type ISessionModel = Model<ISession, object, ISessionMethods>;

const schema = new mongoose.Schema<ISession, ISessionModel, ISessionMethods>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

schema.methods.compareRefreshToken = async function (
  refreshToken: string
): Promise<boolean> {
  return bcrypt.compare(this.refreshTokenHash, refreshToken);
};

schema.index({ userId: 1 });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel = mongoose.model<ISession, ISessionModel>(
  "Session",
  schema
);
