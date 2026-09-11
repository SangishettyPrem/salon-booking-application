import { asyncHandler } from "@/handlers/asyncHandler.js";
import * as authController from "./auth.controller.js";
import * as authSchema from "./auth.schema.js";
import Router from "express";
import { validate } from "@/middlewares/validate.middleware.js";
import { attachUser, requireAuth } from "@/middlewares/auth.middleware.js";

const router = Router();

router.post("/send-otp", authController.sendOTP);
router.post("/verify-otp", authController.verifyOTP);

// Public routes
router.post(
  "/register",
  validate(authSchema.registerSchema),
  asyncHandler(authController.register),
);
router.post(
  "/login",
  validate(authSchema.loginSchema),
  asyncHandler(authController.login),
);
router.post("/logout", asyncHandler(authController.logout));
router.post("/refresh", asyncHandler(authController.refresh));
router.get("/session", asyncHandler(authController.session));

router.post(
  "/forgot-password",
  validate(authSchema.forgotPasswordSchema),
  asyncHandler(authController.forgotPassword),
);

router.post(
  "/update-profile",
  attachUser,
  validate(authSchema.updateProfileSchema),
  asyncHandler(authController.updateProfile),
);

router.post(
  "/reset-password",
  validate(authSchema.resetPasswordSchema),
  asyncHandler(authController.resetPassword),
);

router.post("/change-password", attachUser, authController.changePassword);

// Protected routes (accepts token from header / cookie / gateway headers)
router.use(attachUser);

router.get("/me", requireAuth, asyncHandler(authController.getMe));

router.put(
  "/profile",
  requireAuth,
  validate(authSchema.updateProfileSchema),
  asyncHandler(authController.updateProfile),
);

router.delete(
  "/account",
  requireAuth,
  asyncHandler(authController.deleteAccount),
);

export default router;
