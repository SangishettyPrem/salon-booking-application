import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import { hashPassword } from "@/utils/password.js";

export enum UserRole {
  CUSTOMER = "customer",
  OWNER = "owner",
  STAFF = "staff",
  ADMIN = "admin",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  // methods
  comparePassword(password: string): Promise<boolean>;
}

export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}

export type IUserModel = Model<IUser, object, IUserMethods>;

const UserSchema: Schema<IUser> = new Schema<IUser, IUserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      index: true,
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name must be less than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      index: true,
      trim: true,
      match: [/^[0-9]\d{9}$/, "Invalid phone number"],
    },
    password: {
      type: String,
      select: false,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt
  },
);

UserSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

UserSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const passwordHash = await hashPassword(this.password);
  this.password = passwordHash;
});

export const UserModel: Model<IUser> = mongoose.model<IUser>(
  "User",
  UserSchema,
);
