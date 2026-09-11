import type { NextFunction, Request, Response } from "express";
import * as authService from "./auth.service.js";
import { refreshCookieOptions } from "@/config/cookie.config.js";

export const register = async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });
};

export const login = async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } = await authService.login(req);

  // Set both cookies for convenience
  res.cookie("rt", refreshToken, refreshCookieOptions);

  return res.status(200).json({
    message: "Login Success",
    success: true,
    user,
    access_token: accessToken,
  });
};

export const getMe = async (req: Request, res: Response) => {
  const userId = req.user?._id || (req.user as any)?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
  const user = await authService.getMe(userId);
  return res.status(200).json({
    success: true,
    user,
  });
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?._id || req.body._id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
  const user = await authService.updateProfile(userId, req.body);
  return res.status(200).json({
    message: "Profile updated successfully",
    success: true,
    user,
  });
};

export const deleteAccount = async (req: Request, res: Response) => {
  const userId = req.user?._id || (req.user as any)?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
  await authService.deleteAccount(userId);
  res.clearCookie("rt");

  return res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
};

export const forgotPassword = async (
  req: Request<{}, {}, { email: string }>,
  res: Response,
) => {
  await authService.forgotPassword(req.body.email);
  return res.status(200).json({
    success: true,
    message:
      "If an account exists for this email, a password reset link has been sent.",
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  await authService.resetPassword(req.body);
  return res.status(200).json({
    success: true,
    message: "Your password has been reset successfully.",
  });
};

export const session = async (req: Request, res: Response) => {
  const refreshToken =
    req.cookies?.["rt"] ||
    req.body?.refreshToken ||
    (req.headers["x-refresh-token"] as string | undefined);

  if (!refreshToken) {
    return res.status(200).json({
      success: false,
      message: "No active session",
      user: null,
      access_token: null,
    });
  }

  const { accessToken, user } = await authService.session(refreshToken);

  return res.status(200).json({
    message: "Session found",
    success: true,
    access_token: accessToken,
    user,
  });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken =
    req.cookies?.["rt"] ||
    req.body?.refreshToken ||
    (req.headers["x-refresh-token"] as string | undefined);

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "No refresh token provided",
      user: null,
      access_token: null,
    });
  }

  const { accessToken, user } = await authService.session(refreshToken);

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    access_token: accessToken,
    user,
  });
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies["rt"];
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  res.clearCookie("rt");
  return res.status(200).json({
    message: "Logout Success",
    success: true,
  });
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const result = await authService.changePassword(userId, req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const sendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    const result = await authService.sendOTP(email);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    const result = await authService.verifyOTP(email, otp);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
