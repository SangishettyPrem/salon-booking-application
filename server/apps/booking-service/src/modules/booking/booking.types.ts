import type {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "./booking.model.js";

export interface CreateBookingRequest {
  salonId: string;
  salonName: string;
  salonAddress: string;
  salonPhone: string;
  salonEmail: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceName: string[] | [];
  staffName: string;
  date: string;
  time: string;
  durationMinutes: number;
  price: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  razorpayOrderId: string;
  razorpayPaymentId: string;
}

export interface UpdateBookingPaymentStatusRequest {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paymentStatus: "Paid" | "Failed";
}

export interface SlotAvailability {
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  isPassed: boolean;
  isLocked: boolean;
}

export interface SalonAvailabilityResponse {
  date: string;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  workingDays: string;
  bookedSlots: string[];
}

export interface GetAvailabilityParams {
  salonId: string;
  date: string;
  slotDuration?: number | string;
}

export interface daySchedule {
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

export type Days =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface GetSalonBusinessHoursResponse {
  businessHours: Record<Days, daySchedule>;
  _id: string;
}
