import api from "@/api/api";
import type * as authTypes from "./auth.types";

export const registerUserAPI = async (request: authTypes.RegisterState) =>
  await api.post("/auth/register", request);

export const loginAPI = async (request: authTypes.LoginState) =>
  await api.post("/auth/login", request);

export const forgotPasswordAPI = async (email: string) =>
  await api.post("/auth/forgot-password", { email });

export const updateProfileAPI = async (request: authTypes.UpdateProfileState) =>
  await api.post("/auth/update-profile", request);

export const resetPasswordAPI = async (request: authTypes.ResetPasswordState) =>
  await api.post("/auth/reset-password", request);

export const changePasswordAPI = async (
  request: authTypes.ChangePasswordState,
) => await api.post("/auth/change-password", request);

export const checkSessionAPI = async () => await api.get("/auth/session");

export const logoutAPI = async () => await api.post("/auth/logout");

export const deleteAccountAPI = async () => await api.delete("/auth/account");

export const sendOTPAPI = async (request: authTypes.SendOTPRequest) =>
  await api.post("/auth/send-otp", request);

export const verifyOTPAPI = async (request: authTypes.VerifyOTPRequest) =>
  await api.post("/auth/verify-otp", request);
