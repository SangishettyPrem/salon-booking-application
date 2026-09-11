import * as z from "zod";

const serviceItemSchema = z.object({
  name: z.string({ error: "Service name is required" }).min(1),
  price: z.coerce.number().optional(),
  durationMinutes: z.coerce.number().optional(),
});

export const createBookingSchema = z.object({
  salonId: z.string({ error: "Salon ID is required" }).min(1),
  salonName: z.string({ error: "Salon name is required" }).min(1),
  salonAddress: z.string().optional().default(""),
  salonPhone: z.string().optional().default(""),
  customerId: z.string().optional(),
  customerName: z.string({ error: "Customer name is required" }).min(2),
  customerPhone: z
    .string({ error: "Customer phone is required" })
    .regex(/^\d{10}$/, "Invalid 10-digit phone number"),
  customerEmail: z
    .string({ error: "Customer email is required" })
    .email("Invalid email address"),
  serviceName: z.array(z.string()).min(1, "Service name is required"),
  staffName: z.string().optional(),
  date: z
    .string({ error: "Booking date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string({ error: "Booking time is required" }).min(1),
  durationMinutes: z.coerce.number().min(5).default(45),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  paymentMethod: z
    .union([
      z.enum(["Razorpay Online", "Pay at Salon"]),
      z.literal("razorpay").transform(() => "Razorpay Online" as const),
      z.literal("at_salon").transform(() => "Pay at Salon" as const),
    ])
    .default("Pay at Salon"),
  paymentStatus: z.enum(["Paid", "Pending", "Failed"]).optional(),
  status: z.enum(["Confirmed", "Pending", "Completed", "Cancelled"]).optional(),
  bookingCode: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["Confirmed", "Pending", "Completed", "Cancelled"], {
    error: "Status must be Confirmed, Pending, Completed, or Cancelled",
  }),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(["Paid", "Pending", "Refunded"]),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  status: z.enum(["Confirmed", "Pending", "Completed", "Cancelled"]).optional(),
});
