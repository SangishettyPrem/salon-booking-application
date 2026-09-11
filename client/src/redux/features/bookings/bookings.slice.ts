import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  BookingState,
  BookingStatus,
  CreateBookingRequest,
  CreateBookingResponse,
  GetCustomerBookingResponse,
  GetOwnerBookingsResponse,
  GetSalonAvailabilityParams,
  GetSalonAvailabilityResponse,
  UpdateBookingStatusRequest,
  UpdateBookingStatusResponse,
} from "./bookings.types";
import * as bookingsAPI from "./booking.api";

const initialState: BookingState = {
  isBookingsFetched: false,
  isBookingsLoading: false,
  bookings: [],
  bookingsError: null,
  bookingSummary: {
    cancelledCount: 0,
    completedCount: 0,
    confirmedCount: 0,
    totalBookings: 0,
    totalRevenue: 0,
  },
  salonAvailiability: {},
};

export const createBooking = createAsyncThunk<
  CreateBookingResponse,
  CreateBookingRequest
>(
  "bookings/createBooking",
  async (data: CreateBookingRequest, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.createBookingAPI(data);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (typeof error.response?.data === "string"
          ? error.response?.data
          : null) ||
        error.message ||
        "Failed to create booking.";
      return rejectWithValue(message);
    }
  },
);

export const getOwnerBookings = createAsyncThunk<
  GetOwnerBookingsResponse,
  { status?: string; date?: string } | undefined
>("bookings/getOwnerBookings", async (params, { rejectWithValue }) => {
  try {
    const response = await bookingsAPI.getOwnerBookingsAPI(params);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ??
        "Failed to Load Bookings. Try Again Later.",
    );
  }
});

export const getCustomerBookings = createAsyncThunk<GetCustomerBookingResponse>(
  "bookings/getCustomerBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.getMyBookingsAPI();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ??
          "Failed to Load Bookings. Try Again Later.",
      );
    }
  },
);

export const updateBookingStatus = createAsyncThunk<
  UpdateBookingStatusResponse & { bookingId: string; status: BookingStatus },
  UpdateBookingStatusRequest
>(
  "bookings/updateBookingStatus",
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.updateBookingStatusAPI(
        bookingId,
        status,
      );
      return {
        ...response.data,
        bookingId,
        status,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ??
          `Failed to update booking to ${status}.`,
      );
    }
  },
);

export const cancelBooking = createAsyncThunk<{ bookingId: string }, string>(
  "bookings/cancelBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await bookingsAPI.cancelBookingAPI(bookingId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ?? "Failed to cancel booking.",
      );
    }
  },
);

export const getSalonAvailability = createAsyncThunk<
  GetSalonAvailabilityResponse,
  GetSalonAvailabilityParams
>("bookings/getSalonAvailability", async (request, { rejectWithValue }) => {
  try {
    const response = await bookingsAPI.getSalonAvailabilityAPI(request);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ?? "Failed to get salon availability.",
    );
  }
});

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Booking
      .addCase(createBooking.fulfilled, (state, action) => {
        if (!action.payload.success) return;
        const { booking } = action.payload;
        state.bookings.push(booking);
      })
      // getOwnerBookings
      .addCase(getOwnerBookings.pending, (state) => {
        state.isBookingsLoading = true;
        state.bookingsError = null;
      })
      .addCase(getOwnerBookings.fulfilled, (state, action) => {
        state.isBookingsLoading = false;
        const { bookings, summary } = action.payload;
        state.bookings = bookings;
        state.bookingSummary = summary;
        state.isBookingsFetched = true;
        state.bookingsError = null;
      })
      .addCase(getOwnerBookings.rejected, (state, action) => {
        state.isBookingsLoading = false;
        state.bookingsError =
          (action.payload as string) ?? "Failed to load bookings.";
      })

      // get Customer Bookings
      .addCase(getCustomerBookings.pending, (state) => {
        state.isBookingsLoading = true;
        state.bookingsError = null;
      })
      .addCase(getCustomerBookings.fulfilled, (state, action) => {
        state.isBookingsLoading = false;
        const { bookings } = action.payload;
        state.bookings = bookings;
        state.isBookingsFetched = true;
        state.bookingsError = null;
      })
      .addCase(getCustomerBookings.rejected, (state, action) => {
        state.isBookingsLoading = false;
        state.bookingsError =
          (action.payload as string) ?? "Failed to load bookings.";
        state.bookings = [];
      })

      // updateBookingStatus
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const { bookingId, status, booking } = action.payload;
        const index = state.bookings.findIndex(
          (b) => b._id === bookingId || b._id === bookingId,
        );
        if (index !== -1) {
          if (booking) {
            state.bookings[index] = {
              ...state.bookings[index],
              ...booking,
              _id: booking._id || state.bookings[index]._id,
            };
          } else {
            state.bookings[index].status = status;
          }
        }
      })

      // cancelBooking
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const bookingId = action.meta.arg;
        const index = state.bookings.findIndex((b) => b._id === bookingId);
        if (index !== -1) {
          state.bookings[index].status = "Cancelled";
        }
      })

      // Salon Availability
      .addCase(getSalonAvailability.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.data) {
          state.salonAvailiability[action.payload.data.date] =
            action.payload.data;
        }
      });
  },
});

export default bookingSlice.reducer;
