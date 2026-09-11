import type { DefaultResponse } from "@/shared/types";

export type Role = "customer" | "owner" | "staff";
export type Status = "ACTIVE" | "INACTIVE";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: Status;
  emailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  access_token: string | null;
  authError: string | null;
}

export interface LoginState {
  email: string;
  password: string;
}

export interface RegisterState {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "customer" | "owner";
  confirmPassword: string;
}

export interface ResetPasswordState {
  email: string;
  password: string;
  confirmPassword: string;
  token: string;
}

export interface UpdateProfileState {
  _id: string;
  name: string;
  phone: string;
}

export interface ChangePasswordState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginResponse extends DefaultResponse {
  access_token: string;
  user: User;
}

export interface CheckSessionResponse extends DefaultResponse {
  access_token: string;
  user: User;
}

export interface UpdateProfileResponse extends DefaultResponse {
  user: User;
}

export interface SendOTPRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse extends DefaultResponse {
  isVerified: boolean;
  user?: User;
}
