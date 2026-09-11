import crypto from "crypto";
import { razorpayInstance as razorpay } from "@/config/razorpay.config.js";
import { PaymentModel } from "./payment.model.js";
import { env } from "@/config/env.config.js";
import { Types } from "mongoose";
import { publishPaymentEvent } from "@/events/payment.publisher.js";
import type {
  UpdateBookingPaymentStatusRequest,
  VerifyPaymentRequest,
} from "./payment.types.js";
import {
  claimIdempotencyKey,
  completeIdempotencyKey,
  failIdempotencyKey,
  getIdempotencyRecord,
} from "@/utils/idempotency.js";
import { AppError } from "@/handlers/AppError.js";

export interface ICreateOrderInput {
  amount: number;
  bookingId: string;
  bookingCode: string;
  salonId: string;
  customerName: string;
  customerPhone: string;
  serviceName: string[] | [];
}

export interface ICreateOrderResponse {
  orderId: string;
  amount: number | string;
  currency: string;
  keyId: string;
  bookingCode: string;
}

export const createPaymentOrder = async (
  data: ICreateOrderInput,
  customerId: string,
  idempotencyKey: string,
): Promise<ICreateOrderResponse> => {
  const { bookingId, amount, bookingCode } = data;

  if (!bookingId || !amount || !bookingCode) {
    throw new AppError("Booking ID, Amount & Booking Code is required", 400);
  }

  const existingRecord = await getIdempotencyRecord(idempotencyKey);

  if (existingRecord) {
    if (existingRecord.status === "COMPLETED") {
      return existingRecord.data as ICreateOrderResponse;
    }

    if (existingRecord.status === "PROCESSING") {
      throw new AppError(
        "This payment request is already being processed.",
        409,
      );
    }

    if (existingRecord.status === "FAILED") {
      throw new AppError("Previous payment attempt failed.", 500);
    }
  }

  const claimed = await claimIdempotencyKey({
    idempotencyKey,
    bookingId,
  });

  if (!claimed) {
    throw new AppError("This payment request is already being processed.", 409);
  }

  let order;

  try {
    const amountInPaise = Math.round(amount * 100);
    order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: bookingId,
    });
  } catch (error) {
    await failIdempotencyKey({
      idempotencyKey,
      bookingId,
    });

    throw error;
  }

  try {
    await PaymentModel.create({
      ...(customerId && Types.ObjectId.isValid(customerId)
        ? { userId: new Types.ObjectId(customerId) }
        : {}),

      ...(data.salonId && Types.ObjectId.isValid(data.salonId)
        ? { salonId: new Types.ObjectId(data.salonId) }
        : {}),

      bookingCode,
      orderId: order.id,
      amount: data.amount,
      currency: "INR",
      status: "CREATED",

      customerName: data.customerName || "",
      customerPhone: data.customerPhone || "",
      serviceName: data.serviceName || [],

      paymentMethod: "Razorpay Online",
    });
  } catch (error) {
    throw error;
  }

  const response: ICreateOrderResponse = {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.razorpay.keyId,
    bookingCode,
  };

  await completeIdempotencyKey({
    idempotencyKey,
    bookingId,
    data: response,
  });

  return response;
};

export const verifyRazorpayPayment = async (data: VerifyPaymentRequest) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = data;
  try {
    const keySecret = env.razorpay.keySecret;

    // Generate HMAC SHA256 Signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      await PaymentModel.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { $set: { status: "FAILED", paymentId: razorpay_payment_id } },
      );
      publishPaymentEvent("payment.verified", {
        paymentStatus: "Failed",
        bookingId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      } as UpdateBookingPaymentStatusRequest);
      throw new Error("Invalid payment signature");
    }

    await PaymentModel.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        $set: {
          status: "PAID",
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        },
      },
    );

    publishPaymentEvent("payment.verified", {
      paymentStatus: "Paid",
      bookingId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    } as UpdateBookingPaymentStatusRequest);

    return true;
  } catch (error) {
    publishPaymentEvent("payment.verified", {
      paymentStatus: "Failed",
      bookingId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    } as UpdateBookingPaymentStatusRequest);
    throw error;
  }
};

export const getOwnerPayments = async (filters: {
  salonId?: string | undefined;
  status?: string | undefined;
}) => {
  const query: Record<string, any> = {};

  if (filters.salonId && Types.ObjectId.isValid(filters.salonId)) {
    query.salonId = new Types.ObjectId(filters.salonId);
  }

  if (filters.status && filters.status !== "All") {
    if (filters.status === "Completed" || filters.status === "Paid") {
      query.status = "PAID";
    } else if (filters.status === "Pending") {
      query.status = "CREATED";
    } else if (filters.status === "Failed") {
      query.status = "FAILED";
    } else {
      query.status = filters.status;
    }
  }

  const paymentsList = await PaymentModel.find(query).sort({ createdAt: -1 });

  const transactions = paymentsList.map((p) => ({
    id: p._id.toString(),
    _id: p._id.toString(),
    transactionCode: p.paymentId || p.orderId,
    bookingCode: p.bookingCode,
    orderId: p.orderId,
    paymentId: p.paymentId || "",
    amount: p.amount,
    total: p.amount,
    currency: p.currency || "INR",
    status:
      p.status === "PAID"
        ? "Completed"
        : p.status === "CREATED"
          ? "Pending"
          : "Failed",
    rawStatus: p.status,
    method: p.paymentMethod || "Razorpay Online",
    customerName: p.customerName || "Customer",
    customerPhone: p.customerPhone || "",
    serviceName: p.serviceName || "Salon Service",
    date: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "",
    createdAt: p.createdAt,
  }));

  const totalRevenue = paymentsList
    .filter((tx) => tx.status === "PAID")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return {
    totalRevenue,
    transactions,
    payments: transactions,
  };
};

export const getCustomerPayments = async (customerId: string) => {
  const query: Record<string, any> = {};
  if (Types.ObjectId.isValid(customerId)) {
    query.userId = new Types.ObjectId(customerId);
  } else {
    query.userId = customerId;
  }

  const transactions = await PaymentModel.find(query).sort({ createdAt: -1 });
  return transactions;
};

export const getPaymentById = async (idOrCode: string) => {
  let query: Record<string, any> = {};
  if (Types.ObjectId.isValid(idOrCode)) {
    query = { _id: new Types.ObjectId(idOrCode) };
  } else if (idOrCode.startsWith("order_")) {
    query = { orderId: idOrCode };
  } else {
    query = { bookingCode: idOrCode.toUpperCase() };
  }

  const payment = await PaymentModel.findOne(query);
  return payment;
};
