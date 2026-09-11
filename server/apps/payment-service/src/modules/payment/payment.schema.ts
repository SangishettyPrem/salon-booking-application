import * as z from "zod";

export const createOrderSchema = z.object({
  amount: z.coerce
    .number({ error: "Amount is required" })
    .min(1, "Amount must be at least ₹1"),
  bookingCode: z.string({ error: "Booking Code is Required" }),
  bookingId: z.string({ error: "Booking ID is Required" }),
  salonId: z.string({ error: "Salon ID is Required" }),
  customerName: z.string({ error: "Customer Name is Required" }),
  customerPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Phone Number")
    .optional(),
  serviceName: z.array(z.string()).min(1, "Service Name is Required"),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z
    .string({ error: "Razorpay order ID is required" })
    .min(1),
  razorpay_payment_id: z
    .string({ error: "Razorpay payment ID is required" })
    .min(1),
  razorpay_signature: z
    .string({ error: "Razorpay signature is required" })
    .min(1),
  bookingId: z.string({ error: "Booking ID is Required" }),
});
