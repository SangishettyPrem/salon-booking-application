import type { NextFunction, Request, Response } from "express";
import * as paymentService from "./payment.service.js";

export const createPaymentOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customerId = req.user?._id;
    if (!customerId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const idempotencyKey = req.header("Idempotency-Key");
    if (
      !idempotencyKey ||
      idempotencyKey.length < 16 ||
      idempotencyKey.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Idempotency-Key",
      });
    }
    const order = await paymentService.createPaymentOrder(
      req.body,
      customerId,
      idempotencyKey,
    );
    return res.status(200).json({
      success: true,
      message: "Razorpay order created successfully",
      order: {
        ...order,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customerId = req.user?._id;
    if (!customerId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    await paymentService.verifyRazorpayPayment({
      ...req.body,
      customerId,
    });
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      verified: true,
    });
  } catch (error) {
    next(error);
  }
};

export const getOwnerPayments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const salonId = (req.query.salonId as string) || undefined;
    const status = (req.query.status as string) || undefined;

    const data = await paymentService.getOwnerPayments({
      salonId,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Owner revenue and transactions fetched successfully",
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerPayments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customerId = req.user?._id;
    if (!customerId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const transactions = await paymentService.getCustomerPayments(customerId);
    return res.status(200).json({
      success: true,
      message: "Customer payments fetched successfully",
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Payment ID or code is required" });
    }
    const payment = await paymentService.getPaymentById(id);
    return res.status(200).json({
      success: true,
      message: "Payment details fetched successfully",
      payment,
    });
  } catch (error) {
    next(error);
  }
};
