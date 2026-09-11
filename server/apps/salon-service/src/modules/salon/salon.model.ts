import mongoose, { Model, Schema, Types } from "mongoose";

// Day Schedule Interface
export interface IDaySchedule {
  isOpen: boolean;
  openingTime: string | null;
  closingTime: string | null;
}

// Business Hours Interface
export interface IBusinessHours {
  monday: IDaySchedule;
  tuesday: IDaySchedule;
  wednesday: IDaySchedule;
  thursday: IDaySchedule;
  friday: IDaySchedule;
  saturday: IDaySchedule;
  sunday: IDaySchedule;
}

// Salon Interface
export interface ISalon {
  ownerId: Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  description?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  category?: string;
  businessHours?: IBusinessHours;
  amenities?: string[];
  coverUrl?: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Salon Model Type

export type ISalonModel = Model<ISalon>;

// Day Schedule Schema
const dayScheduleSchema = new Schema<IDaySchedule>(
  {
    isOpen: {
      type: Boolean,
      default: true,
    },

    openingTime: {
      type: String,
      default: null,
      trim: true,
    },

    closingTime: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const defaultDaySchedule = (): IDaySchedule => ({
  isOpen: false,
  openingTime: null,
  closingTime: null,
});

export const DEFAULT_BUSINESS_HOURS: IBusinessHours = {
  monday: defaultDaySchedule(),
  tuesday: defaultDaySchedule(),
  wednesday: defaultDaySchedule(),
  thursday: defaultDaySchedule(),
  friday: defaultDaySchedule(),
  saturday: defaultDaySchedule(),
  sunday: defaultDaySchedule(),
};

// Business Hours Schema

const businessHoursSchema = new Schema<IBusinessHours>(
  {
    monday: {
      type: dayScheduleSchema,
      required: true,
      default: defaultDaySchedule,
    },

    tuesday: {
      type: dayScheduleSchema,
      required: true,
      default: defaultDaySchedule,
    },

    wednesday: {
      type: dayScheduleSchema,
      required: true,
      default: defaultDaySchedule,
    },

    thursday: {
      type: dayScheduleSchema,
      required: true,
      default: defaultDaySchedule,
    },

    friday: {
      type: dayScheduleSchema,
      required: true,
      default: defaultDaySchedule,
    },

    saturday: {
      type: dayScheduleSchema,
      required: true,
      default: defaultDaySchedule,
    },

    sunday: {
      type: dayScheduleSchema,
      required: true,
      default: defaultDaySchedule,
    },
  },
  {
    _id: false,
  },
);

// Salon Schema

const SalonSchema: Schema<ISalon> = new Schema<ISalon>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Salon name is required"],
      trim: true,
      minlength: [2, "Salon name must be at least 2 characters"],
      maxlength: [80, "Salon name cannot exceed 80 characters"],
      index: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
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

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // -------------------------------------------------
    // Address
    // -------------------------------------------------

    addressLine1: {
      type: String,
      required: [true, "Address Line 1 is required"],
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      index: true,
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      default: "India",
    },

    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
      match: [/^[A-Za-z0-9\s-]{3,12}$/, "Invalid postal code format"],
    },

    category: {
      type: String,
      trim: true,
      maxlength: [80, "Category cannot exceed 80 characters"],
    },

    businessHours: {
      type: businessHoursSchema,
      default: () => ({ ...DEFAULT_BUSINESS_HOURS }),
    },
    amenities: {
      type: [String],
      default: [],
    },

    coverUrl: {
      type: String,
      trim: true,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const SalonModel: ISalonModel = mongoose.model<ISalon>(
  "Salon",
  SalonSchema,
);

export default SalonModel;
