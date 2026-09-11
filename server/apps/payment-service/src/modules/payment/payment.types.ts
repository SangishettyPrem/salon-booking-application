export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId: string;
}

export interface UpdateBookingPaymentStatusRequest {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paymentStatus: "Paid" | "Failed";
}
