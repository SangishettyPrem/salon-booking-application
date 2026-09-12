import type { DefaultResponse } from "@/shared/types";
import type { PaymentMethod, PaymentStatus } from "../payment/payment.types";

export interface BookingState {
  isBookingsFetched: boolean;
  isBookingsLoading: boolean;
  bookings: Booking[];
  bookingsError: string | null;
  bookingSummary: BookingSummaryStats;
  salonAvailiability: Record<string, Availiability>;
}

export interface BookingSummaryStats {
  totalBookings: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
  totalRevenue: number;
}

export interface GetOwnerBookingsResponse extends DefaultResponse {
  bookings: Booking[];
  summary: BookingSummaryStats;
}

export interface UpdateBookingStatusRequest {
  bookingId: string;
  status: BookingStatus;
}

export interface UpdateBookingStatusResponse extends DefaultResponse {
  booking: Booking;
}

export interface GetCustomerBookingResponse extends DefaultResponse {
  bookings: Booking[] | [];
}

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface Booking {
  _id: string;
  salonName: string;
  salonAddress: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  staffName: string;
  date: string;
  time: string;
  durationMinutes: number;
  price: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
}

export interface CreateBookingRequest {
  salonId: string;
  salonName: string;
  salonEmail: string;
  salonAddress: string;
  salonPhone: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceName: Array<{ name: string; price: number; durationMinutes: number }>;
  staffName: string;
  date: string;
  time: string;
  durationMinutes: number;
  price: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export interface CreateBookingResponse extends DefaultResponse {
  booking: Booking;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface SalonAvailabilityData {
  date: string;
  isOpen: boolean;
  openingTime: string | null;
  closingTime: string | null;
  slots: TimeSlot[];
}

export type Availiability = SalonAvailabilityData;

export interface GetSalonAvailabilityParams {
  salonId: string;
  date: string;
  slotDuration: number;
}

export interface GetSalonAvailabilityResponse extends DefaultResponse {
  data: SalonAvailabilityData;
}
