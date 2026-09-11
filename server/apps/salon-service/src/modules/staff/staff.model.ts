import mongoose, { Document, Schema, Model, Types } from "mongoose";

export const STAFF_ROLES = [
  "Senior Stylist",
  "Hair Specialist",
  "Color Master",
  "Skin & Spa Therapist",
  "Barber & Groomer",
  "Makeup Artist",
] as const;

export interface IStaff {
  salonId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  role?: string | undefined;
  assignedServices?: string[] | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type IStaffModel = Model<IStaff>;

const StaffSchema: Schema<IStaff> = new Schema<IStaff>(
  {
    salonId: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: [true, "Salon ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Staff name is required"],
      trim: true,
      minlength: [2, "Staff name must be at least 2 characters"],
      maxlength: [80, "Staff name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      default: "Senior Stylist",
    },
    assignedServices: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const StaffModel: Model<IStaff> = mongoose.model<IStaff>(
  "Staff",
  StaffSchema,
);

export default StaffModel;
