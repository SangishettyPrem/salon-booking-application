import mongoose, { Document, Schema, Model, Types } from "mongoose";

export const BOOKING_STATUSES = [
  "Confirmed",
  "Pending",
  "Completed",
  "Cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = ["Paid", "Pending", "Failed"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ["Razorpay Online", "Pay at Salon"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface IBooking extends Document {
  bookingCode: string;
  salonId: Types.ObjectId;
  salonName: string;
  salonAddress?: string;
  salonPhone?: string;
  customerId: Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceName: string[] | [];
  staffName: string;
  date: string;
  time: string;
  durationMinutes: number;
  price: number;
  status: (typeof BOOKING_STATUSES)[number];
  paymentStatus: (typeof PAYMENT_STATUSES)[number];
  paymentMethod: (typeof PAYMENT_METHODS)[number];
  notes?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IBookingModel = Model<IBooking>;

const BookingSchema: Schema<IBooking> = new Schema<IBooking>(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    salonId: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
      required: [true, "Salon ID is required"],
      index: true,
    },
    salonName: {
      type: String,
      required: [true, "Salon name is required"],
      trim: true,
    },
    salonAddress: {
      type: String,
      trim: true,
      default: "",
    },
    salonPhone: {
      type: String,
      trim: true,
      default: "",
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer ID is required"],
      index: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
    },
    serviceName: {
      type: [String],
      default: [],
    },
    staffName: {
      type: String,
      required: [true, "Staff name is required"],
      trim: true,
      default: "Any Available Specialist",
    },
    date: {
      type: String,
      required: [true, "Booking date (YYYY-MM-DD) is required"],
      trim: true,
      index: true,
    },
    time: {
      type: String,
      required: [true, "Booking time is required"],
      trim: true,
    },
    durationMinutes: {
      type: Number,
      required: [true, "Duration in minutes is required"],
      min: [5, "Duration must be at least 5 minutes"],
      default: 45,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be non-negative"],
    },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "Confirmed",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "Pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "Pay at Salon",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    razorpayOrderId: {
      type: String,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const BookingModel: Model<IBooking> = mongoose.model<IBooking>(
  "Booking",
  BookingSchema,
);

export default BookingModel;
