import api from "@/api/api";
import type {
  CreatePaymentOrderRequest,
  VerifyPaymentRequest,
} from "./payment.types";

// Razorpay Order Creation
export const createPaymentOrderAPI = async (
  data: CreatePaymentOrderRequest,
  idempotencyKey: string,
) =>
  api.post("/payments/create-order", data, {
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });

// Payment Verification
export const verifyPaymentAPI = async (data: VerifyPaymentRequest) =>
  api.post("/payments/verify", data);

// Owner Transactions & Stats
export const getOwnerPaymentsAPI = async (params?: {
  status?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
}) => api.get("/payments/owner", { params });
