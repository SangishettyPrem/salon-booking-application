import Router from "express";
import * as paymentController from "./payment.controller.js";
import { allowedRoles, attachUser } from "@/middlewares/auth.middleware.js";
import { validate } from "@/middlewares/validate.middleware.js";
import { createOrderSchema, verifyPaymentSchema } from "./payment.schema.js";

const router = Router();

// Create Razorpay Order

router.post(
  "/create-order",
  attachUser,
  validate(createOrderSchema),
  paymentController.createPaymentOrder,
);

// Verify Razorpay Payment Signature
router.post(
  "/verify",
  attachUser,
  validate(verifyPaymentSchema),
  paymentController.verifyPayment,
);

// Owner Payment Analytics & Transactions
router.get(
  "/owner",
  attachUser,
  allowedRoles("owner", "admin", "staff"),
  paymentController.getOwnerPayments,
);

// Customer Past Transactions
router.get("/my", attachUser, paymentController.getCustomerPayments);

// Single Transaction Pass / Receipt
router.get("/:id", paymentController.getPaymentById);

export default router;
