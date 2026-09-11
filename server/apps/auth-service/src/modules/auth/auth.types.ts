import type { UserRole } from "./user.model.js";

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  role?: UserRole | "customer" | "owner" | "staff" | "admin";
  password: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AccessTokenPayload {
  role: UserRole | string;
  sub: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
}

export interface ResetPasswordInput {
  token: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
}
