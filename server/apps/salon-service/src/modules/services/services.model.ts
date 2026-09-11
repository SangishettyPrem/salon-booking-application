import mongoose, { Document, Schema, Model, Types } from "mongoose";

export const SERVICE_CATEGORIES = [
  "Haircut & Styling",
  "Beard & Grooming",
  "Skin & Facials",
  "Spa & Massage",
  "Bridal & Makeover",
  "Hair Color & Highlights",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export interface IService {
  salonId: Types.ObjectId;
  name: string;
  category: ServiceCategory;
  price: number;
  durationMinutes: number;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IServiceModel = Model<IService>;

const ServiceSchema: Schema<IService> = new Schema<IService>(
  {
    salonId: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: [true, "Salon ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      minlength: [2, "Service name must be at least 2 characters"],
      maxlength: [100, "Service name cannot exceed 100 characters"],
    },
    category: {
      type: String,
      enum: SERVICE_CATEGORIES,
      required: [true, "Category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be non-negative"],
    },
    durationMinutes: {
      type: Number,
      required: [true, "Duration in minutes is required"],
      min: [5, "Duration must be at least 5 minutes"],
      default: 45,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export const ServiceModel: Model<IService> = mongoose.model<IService>(
  "Service",
  ServiceSchema,
);

export default ServiceModel;
