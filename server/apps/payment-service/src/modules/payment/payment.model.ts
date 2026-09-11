import { Schema, model, Types } from "mongoose";

export interface IPayment {
  userId?: Types.ObjectId;
  salonId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  bookingCode: string;
  orderId: string;
  paymentId?: string;
  signature?: string;
  amount: number;
  currency?: string;
  status: "CREATED" | "PAID" | "FAILED";
  customerName?: string;
  customerPhone?: string;
  serviceName?: string[] | [];
  paymentMethod?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    salonId: { type: Schema.Types.ObjectId, ref: "Salon" },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    bookingCode: { type: String, required: true },
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String, default: "" },
    signature: { type: String, default: "" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["CREATED", "PAID", "FAILED"],
      default: "CREATED",
    },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    serviceName: {
      type: Array<string>,
      default: [],
    },
    paymentMethod: { type: String, default: "Razorpay Online" },
  },
  { timestamps: true },
);

export const PaymentModel = model<IPayment>("Payment", PaymentSchema);
