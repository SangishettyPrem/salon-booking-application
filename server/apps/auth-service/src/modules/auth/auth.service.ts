import { AppError } from "@/handlers/AppError.js";
import type {
  CreateUserData,
  LoginRequest,
  RefreshTokenPayload,
  ResetPasswordInput,
  UpdateProfileRequest,
} from "./auth.types.js";
import { UserModel, UserRole, UserStatus } from "./user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "./auth.token.js";
import {
  findRefreshToken,
  revokeRefreshToken,
  saveRefreshToken,
} from "../session/session.service.js";
import type { Request } from "express";
import { PasswordResetTokenModel } from "../password-reset/password-reset-token.model.js";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "../password-reset/password-reset.utils.js";
import { env } from "@/config/env.config.js";
import { SessionModel } from "../session/session.model.js";
import { publishAuthEvent } from "@/events/auth.publisher.js";
import { OTPModel } from "../otp/otp.model.js";

const validateUser = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) throw new AppError("Invalid Credentials", 404);

  const matched = await user.comparePassword(password);
  if (!matched) throw new AppError("Invalid Password", 401);
  return user;
};

export const register = async (data: CreateUserData) => {
  try {
    const {
      email,
      name,
      phone,
      password,
      role = UserRole.CUSTOMER,
      avatarUrl,
    } = data;

    const formattedEmail = email.trim().toLowerCase();

    const verifiedOtpRecord = await OTPModel.findOne({
      email: formattedEmail,
      isVerified: true,
    });

    if (!verifiedOtpRecord)
      throw new AppError(
        "Email not verified or OTP expired. Please request OTP again.",
        400,
      );

    if (!verifiedOtpRecord) {
      throw new AppError(
        "Please verify your email address before creating an account",
        400,
      );
    }

    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      throw new AppError("Email already exists", 400);
    }
    const existingPhone = await UserModel.findOne({ phone });
    if (existingPhone) {
      throw new AppError("Phone number already exists", 400);
    }
    const user = await UserModel.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: password.trim(),
      role: role as UserRole,
      avatarUrl: avatarUrl || "",
      status: UserStatus.ACTIVE,
      emailVerified: true,
    });

    await OTPModel.deleteMany({ email: formattedEmail });

    return user;
  } catch (error) {
    throw error;
  }
};

export const login = async (req: Request) => {
  try {
    const { email, password } = req.body as LoginRequest;
    const user = await validateUser(email, password);
    const accessToken = generateAccessToken({
      sub: user._id.toString(),
      role: user.role,
      type: "access",
    });
    const refreshToken = generateRefreshToken({
      sub: user._id.toString(),
      type: "refresh",
    });

    await saveRefreshToken({
      _id: user._id.toString(),
      refreshToken,
      req,
    });
    return {
      accessToken,
      refreshToken,
      user,
    };
  } catch (error) {
    throw error;
  }
};

export const getMe = async (userId: string) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (
  userId: string,
  data: UpdateProfileRequest,
) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (data.phone && data.phone !== user.phone) {
      const isPhoneNumberExists = await UserModel.findOne({
        phone: data.phone,
        _id: { $ne: user._id },
      });
      if (isPhoneNumberExists)
        throw new AppError("Phone number already exists", 400);
      user.phone = data.phone.trim();
    }

    if (data.email && data.email.toLowerCase() !== user.email) {
      const isEmailExists = await UserModel.findOne({
        email: data.email.toLowerCase().trim(),
        _id: { $ne: user._id },
      });
      if (isEmailExists) throw new AppError("Email already exists", 400);
      user.email = data.email.toLowerCase().trim();
    }

    if (data.name) {
      user.name = data.name.trim();
    }

    if (data.avatarUrl !== undefined) {
      user.avatarUrl = data.avatarUrl;
    }

    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};

export const deleteAccount = async (userId: string) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    await UserModel.findByIdAndDelete(userId);
    await SessionModel.deleteMany({ userId });
    await PasswordResetTokenModel.deleteMany({ userId });

    return true;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail }).exec();
    if (!user) return;

    if (user.status !== UserStatus.ACTIVE) return;

    await PasswordResetTokenModel.updateMany(
      {
        userId: user._id,
        usedAt: null,
      },
      {
        $set: {
          usedAt: new Date(),
        },
      },
    ).exec();

    const resetToken = generatePasswordResetToken();
    const hashToken = hashPasswordResetToken(resetToken);
    const expiresAt = new Date(
      Date.now() + env.passwordResetExpiresMinutes * 60 * 1000,
    ); // expires in 15 minutes

    await PasswordResetTokenModel.create({
      userId: user._id,
      tokenHash: hashToken,
      expiresAt,
      usedAt: null,
    });

    publishAuthEvent("password.reset.requested", {
      email: user.email,
      name: user.name,
      resetToken,
    });
  } catch (error) {
    throw error;
  }
};

export const logout = async (refreshToken: string) => {
  try {
    await revokeRefreshToken(refreshToken);
    return true;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (data: ResetPasswordInput) => {
  try {
    const { confirmPassword, password, token, email } = data;
    const tokenHash = hashPasswordResetToken(token);

    const resetToken = await PasswordResetTokenModel.findOne({
      tokenHash,
      usedAt: null,
    }).exec();

    if (!resetToken)
      throw new AppError("Invalid or expired password reset link", 400);

    if (resetToken.expiresAt.getTime() <= Date.now())
      throw new AppError("Invalid or expired password reset link", 400);

    if (password !== confirmPassword)
      throw new AppError("Passwords do not match", 400);

    const user = await UserModel.findOne({
      _id: resetToken.userId,
      email: email.trim().toLowerCase(),
    }).exec();

    if (!user) throw new AppError("User not found", 404);

    user.password = password;
    user.updatedAt = new Date();
    user.emailVerified = true;

    await user.save();

    resetToken.usedAt = new Date();
    await resetToken.save();

    await SessionModel.updateMany(
      {
        userId: resetToken.userId,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    ).exec();
    publishAuthEvent("password.reset.success", user.email);
  } catch (error) {
    throw error;
  }
};

export const session = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("No refresh token provided.", 401, "UNAUTHENTICATED");
  }

  let payload: RefreshTokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken) as RefreshTokenPayload;
  } catch (error: any) {
    console.error(
      "JWT Verification failed details:",
      error.message,
      error.stack,
    );
    if (error.name === "TokenExpiredError") {
      await revokeRefreshToken(refreshToken);
      throw new AppError("Refresh token expired.", 401, "SESSION_EXPIRED");
    }
    await revokeRefreshToken(refreshToken);
    throw new AppError("Invalid refresh token.", 401, "INVALID_SESSION");
  }

  if (payload.type !== "refresh") {
    await revokeRefreshToken(refreshToken);
    throw new AppError("Invalid session token.", 401, "INVALID_SESSION");
  }

  const { sub } = payload;

  const session = await findRefreshToken(refreshToken);
  if (
    !session ||
    session.isRevoked ||
    session.expiresAt.getTime() <= Date.now()
  ) {
    throw new AppError("Session expired or revoked.", 401, "SESSION_EXPIRED");
  }

  const user = await UserModel.findById(sub).exec();
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError("Account is not active", 403, "ACCOUNT_INACTIVE");
  }

  const accessToken = await generateAccessToken({
    sub: user._id.toString(),
    role: user.role,
    type: "access",
  });

  return { accessToken, user };
};

export const changePassword = async (
  userId: string,
  data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  },
) => {
  const { currentPassword, newPassword, confirmPassword } = data;

  if (newPassword !== confirmPassword) {
    throw new AppError("New password and confirm password do not match", 400);
  }

  const user = await UserModel.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isCurrentValid = await user.comparePassword(currentPassword);
  if (!isCurrentValid) {
    throw new AppError(
      "Incorrect current Password",
      400,
      "INVALID_CURRENT_PASSWORD",
    );
  }

  const isSamePassword = await user.comparePassword(newPassword);
  if (isSamePassword) {
    throw new AppError(
      "New password must be different from current password",
      400,
    );
  }

  user.password = newPassword;
  await user.save();

  return {
    success: true,
    message: "Password updated successfully",
  };
};

export const sendOTP = async (email: string) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OTPModel.deleteMany({ email });
    await OTPModel.create({
      email,
      otp,
      expiresAt,
      isVerified: false,
    });

    publishAuthEvent("otp.sent", { email, otp });

    return { success: true, message: "Verification code sent to your email" };
  } catch (error) {
    throw error;
  }
};

export const verifyOTP = async (email: string, otp: string) => {
  const formattedEmail = email.trim().toLowerCase();
  const record = await OTPModel.findOne({ email: formattedEmail, otp });

  if (!record || record.expiresAt < new Date()) {
    throw new AppError("Invalid or expired verification code", 400);
  }

  const existingUser = await UserModel.findOneAndUpdate(
    { email },
    { emailVerified: true },
    { new: true },
  );
  if (existingUser) {
    // If user already exists, clean up OTP record immediately
    await OTPModel.deleteMany({ email: formattedEmail });
    return {
      success: true,
      isVerified: true,
      message: "Email verified successfully",
      user: existingUser,
    };
  }

  record.isVerified = true;
  record.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await record.save();
  return {
    success: true,
    isVerified: true,
    message: "Email verified successfully",
  };
};
