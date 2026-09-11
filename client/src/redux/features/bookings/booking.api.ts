import api from "@/api/api";
import type {
  CreateBookingRequest,
  GetSalonAvailabilityParams,
  GetSalonAvailabilityResponse,
} from "./bookings.types";

// Customer Bookings
export const createBookingAPI = async (data: CreateBookingRequest) =>
  api.post("/bookings", data);

export const getMyBookingsAPI = async () => api.get("/bookings/my");

export const getBookingByIdAPI = async (id: string) =>
  api.get(`/bookings/${id}`);

export const cancelBookingAPI = async (id: string) =>
  api.patch(`/bookings/${id}/cancel`);

// Owner Bookings
export const getOwnerBookingsAPI = async (params?: {
  status?: string;
  date?: string;
}) => api.get("/bookings/owner", { params });

export const updateBookingStatusAPI = async (id: string, status: string) =>
  api.patch(`/bookings/${id}/status`, { status });

export const getSalonAvailabilityAPI = async (
  params: GetSalonAvailabilityParams,
) =>
  api.get<GetSalonAvailabilityResponse>("/bookings/availability", { params });
