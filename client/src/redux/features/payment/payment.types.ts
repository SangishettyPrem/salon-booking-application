import type { DefaultResponse } from "@/shared/types";

export interface PaymentState {
  isPaymentsFetched: boolean;
  isPaymentsLoading: boolean;
  payments: PaymentTransaction[];
  paymentsError: string | null;
}

export interface GetOwnerPaymentsResponse extends DefaultResponse {
  transactions?: PaymentTransaction[];
  payments?: PaymentTransaction[];
  stats?: {
    totalRevenue: number;
    completedCount: number;
    pendingAmount: number;
  };
}

export interface CreatePaymentOrderRequest {
  amount: number;
  bookingId: string;
  bookingCode: string;
  salonId: string;
  customerName: string;
  customerPhone: string;
  serviceName: string[];
}

export interface CreatePaymentOrderResponse extends DefaultResponse {
  order: {
    orderId: string;
    amount: string;
    currency: string | number;
    keyId: string;
    bookingCode: string;
  };
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId: string;
}

export interface VerifyPaymentResponse extends DefaultResponse {
  verified: boolean;
}

export type PaymentMethod = "at_salon" | "razorpay";

export type PaymentStatus = "Pending" | "Failed" | "Paid";

export interface PaymentTransaction {
  id: string;
  transactionCode: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  amount: number;
  tax: number;
  total: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
}
