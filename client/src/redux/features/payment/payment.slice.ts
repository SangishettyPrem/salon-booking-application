import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  CreatePaymentOrderRequest,
  CreatePaymentOrderResponse,
  GetOwnerPaymentsResponse,
  PaymentState,
  PaymentTransaction,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "./payment.types";
import * as paymentAPI from "./payment.api";

const initialState: PaymentState = {
  isPaymentsFetched: false,
  isPaymentsLoading: false,
  payments: [],
  paymentsError: null,
};

export const getOwnerPayments = createAsyncThunk<
  GetOwnerPaymentsResponse,
  | { status?: string; method?: string; startDate?: string; endDate?: string }
  | undefined
>("payment/getOwnerPayments", async (params, { rejectWithValue }) => {
  try {
    const response = await paymentAPI.getOwnerPaymentsAPI(params);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ??
        "Failed to load payments. Try again later.",
    );
  }
});

export const createPaymentOrder = createAsyncThunk<
  CreatePaymentOrderResponse,
  { data: CreatePaymentOrderRequest; idempotencyKey: string }
>(
  "payment/createPaymentOrder",
  async ({ data, idempotencyKey }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.createPaymentOrderAPI(
        data,
        idempotencyKey,
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create payment order. Try again later.",
      );
    }
  },
);

export const verifyPayment = createAsyncThunk<
  VerifyPaymentResponse,
  VerifyPaymentRequest
>(
  "payment/verifyPayment",
  async (data: VerifyPaymentRequest, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.verifyPaymentAPI(data);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (typeof error.response?.data === "string"
          ? error.response?.data
          : null) ||
        error.message ||
        "Failed to verify payment. Try again later.";
      return rejectWithValue(message);
    }
  },
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setPayments: (state, action: PayloadAction<PaymentTransaction[]>) => {
      state.payments = action.payload;
    },
    resetPaymentsState: (state) => {
      state.isPaymentsFetched = false;
      state.isPaymentsLoading = false;
      state.payments = [];
      state.paymentsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOwnerPayments.pending, (state) => {
        state.isPaymentsLoading = true;
        state.paymentsError = null;
      })
      .addCase(getOwnerPayments.fulfilled, (state, action) => {
        state.isPaymentsLoading = false;
        state.payments =
          action.payload.transactions || action.payload.payments || [];
        state.isPaymentsFetched = true;
        state.paymentsError = null;
      })
      .addCase(getOwnerPayments.rejected, (state, action) => {
        state.isPaymentsLoading = false;
        state.paymentsError =
          (action.payload as string) ?? "Failed to load payments.";
      });
  },
});

export const { setPayments, resetPaymentsState } = paymentSlice.actions;

export default paymentSlice.reducer;
