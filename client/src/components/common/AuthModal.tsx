import React, { useState, useEffect } from "react";
import {
  X,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Check,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ShieldCheck,
} from "lucide-react";
import { useFormik } from "formik";
import {
  LoginValidationSchema,
  RegisterValidationSchema,
} from "@/validations/auth.validations";
import type {
  LoginState,
  RegisterState,
} from "@/redux/features/auth/auth.types";
import { useAppDispatch } from "@/redux/hooks/redux.hooks";
import * as authSlice from "@/redux/features/auth/auth.slice";
import { handleError, handleSuccess } from "@/utils/handleResponse";
import TextField from "@/components/common/TextField";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
}

const loginInitialValues: LoginState = {
  email: "",
  password: "",
};

const registerInitialValues: RegisterState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "customer",
  confirmPassword: "",
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Sign In to Complete Reservation",
  subtitle = "Please sign in to confirm your appointment and proceed to payment.",
}) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Email verification state for registration
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [otpError, setOtpError] = useState<string>("");

  useEffect(() => {
    let interval: any;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const loginFormik = useFormik({
    initialValues: loginInitialValues,
    validationSchema: LoginValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        const { success, message } = await dispatch(
          authSlice.Login(values),
        ).unwrap();
        if (success) {
          handleSuccess("Logged in successfully!");
          onSuccess();
        } else {
          handleError(message ?? "Failed to Login");
        }
      } catch (error: any) {
        handleError(error ?? "Failed to Login");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const registerFormik = useFormik({
    initialValues: registerInitialValues,
    validationSchema: RegisterValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!isEmailVerified) {
        return handleError(
          "Please verify your email address before creating an account.",
        );
      }

      try {
        setSubmitting(true);
        const result = await dispatch(authSlice.Register(values)).unwrap();
        if (result.success) {
          handleSuccess("Account registered! Please sign in.");
          setActiveTab("login");
          loginFormik.setFieldValue("email", values.email);
        } else {
          handleError(result.message ?? "Failed to Register");
        }
      } catch (error: any) {
        handleError(error ?? "Failed to Register");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleSendRegisterOtp = async () => {
    const email = registerFormik.values.email.trim();
    if (!email) {
      return handleError("Please enter your email address first.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return handleError("Please enter a valid email address.");
    }

    try {
      setIsSendingOtp(true);
      setOtpError("");
      const result = await dispatch(authSlice.SendOTP({ email })).unwrap();
      if (result.success) {
        setShowOtpInput(true);
        setOtpTimer(30);
        handleSuccess("Verification code sent to your email.");
      } else {
        setOtpError(result.message ?? "Failed to send code.");
        handleError(result.message ?? "Failed to send code.");
      }
    } catch (error: any) {
      setOtpError(error ?? "Failed to send code.");
      handleError(error ?? "Failed to send code.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyRegisterOtp = async () => {
    const email = registerFormik.values.email.trim();
    if (!otp.trim() || otp.trim().length < 4) {
      setOtpError("Please enter a valid 6-digit code.");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      setOtpError("");
      const result = await dispatch(
        authSlice.VerifyOTP({ email, otp: otp.trim() }),
      ).unwrap();
      if (result.success) {
        setIsEmailVerified(true);
        setShowOtpInput(false);
        handleSuccess("Email verified successfully!");
      } else {
        setOtpError(result.message ?? "Invalid verification code.");
      }
    } catch (error: any) {
      setOtpError(error ?? "Invalid verification code.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-(--surface) border border-(--line) shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-(--soft) hover:bg-(--line) text-(--muted) hover:text-(--ink) transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-(--rose)/10 text-(--rose) text-[11px] font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>Account Required</span>
          </div>
          <h3 className="text-xl font-extrabold text-(--ink) tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-(--muted) leading-relaxed">{subtitle}</p>
        </div>

        {/* Switch Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-(--paper) border border-(--line)">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "login"
                ? "bg-(--rose) text-white shadow-xs"
                : "text-(--muted) hover:text-(--ink)"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "register"
                ? "bg-(--rose) text-white shadow-xs"
                : "text-(--muted) hover:text-(--ink)"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* LOGIN FORM */}
        {activeTab === "login" ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const errors = await loginFormik.validateForm();
              if (Object.keys(errors).length > 0) {
                return handleError(Object.values(errors)[0]);
              }
              await loginFormik.submitForm();
            }}
            className="space-y-4 pt-1"
          >
            <TextField
              id="modal-login-email"
              name="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={loginFormik.values.email}
              onChange={loginFormik.handleChange}
              onBlur={loginFormik.handleBlur}
              error={loginFormik.errors.email}
              touched={loginFormik.touched.email}
              required
              startAdornment={<Mail size={16} />}
            />

            <TextField
              id="modal-login-password"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={loginFormik.values.password}
              onChange={loginFormik.handleChange}
              onBlur={loginFormik.handleBlur}
              error={loginFormik.errors.password}
              touched={loginFormik.touched.password}
              required
              startAdornment={<Lock size={16} />}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-(--muted) hover:text-(--ink) cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-(--rose) text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? "Signing In..." : "Sign In & Proceed"}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const errors = await registerFormik.validateForm();
              if (Object.keys(errors).length > 0) {
                return handleError(Object.values(errors)[0]);
              }
              if (!isEmailVerified) {
                return handleError(
                  "Please verify your email address before creating an account.",
                );
              }
              await registerFormik.submitForm();
            }}
            className="space-y-3.5 pt-1"
          >
            <TextField
              id="modal-register-name"
              name="name"
              label="Full Name"
              placeholder="e.g. Jane Doe"
              value={registerFormik.values.name}
              onChange={registerFormik.handleChange}
              onBlur={registerFormik.handleBlur}
              error={registerFormik.errors.name}
              touched={registerFormik.touched.name}
              required
              startAdornment={<User size={16} />}
            />

            <TextField
              id="modal-register-phone"
              name="phone"
              label="Phone Number"
              type="tel"
              inputMode="tel"
              maxLength={10}
              placeholder="9876543210"
              value={registerFormik.values.phone}
              onChange={(e) =>
                registerFormik.setFieldValue(
                  "phone",
                  e.target.value.replace(/\D/g, ""),
                )
              }
              onBlur={registerFormik.handleBlur}
              error={registerFormik.errors.phone}
              touched={registerFormik.touched.phone}
              required
              startAdornment={<Phone size={16} />}
            />

            {/* Email with Verification */}
            <div className="space-y-2">
              <TextField
                id="modal-register-email"
                name="email"
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={registerFormik.values.email}
                onChange={(e) => {
                  registerFormik.handleChange(e);
                  if (isEmailVerified) setIsEmailVerified(false);
                  if (showOtpInput) setShowOtpInput(false);
                }}
                onBlur={registerFormik.handleBlur}
                error={registerFormik.errors.email}
                touched={registerFormik.touched.email}
                required
                readOnly={isEmailVerified}
                startAdornment={<Mail size={16} />}
                endAdornment={
                  isEmailVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 size={13} />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendRegisterOtp}
                      disabled={
                        isSendingOtp ||
                        !registerFormik.values.email ||
                        Boolean(registerFormik.errors.email)
                      }
                      className="text-[11px] font-bold text-(--rose) hover:text-(--rose-dark) bg-(--soft) hover:bg-(--line)/50 disabled:opacity-50 px-2.5 py-1 rounded-lg border border-(--line) transition cursor-pointer"
                    >
                      {isSendingOtp ? "Sending..." : "Verify Email"}
                    </button>
                  )
                }
              />

              {/* Inline OTP Verification Panel */}
              {!isEmailVerified && showOtpInput && (
                <div className="p-3 rounded-2xl bg-(--soft) border border-(--line) space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-(--ink) flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-(--rose)" />
                      Enter 6-Digit Code
                    </span>
                    {otpTimer > 0 ? (
                      <span className="text-[11px] text-(--muted)">
                        Resend in {otpTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendRegisterOtp}
                        disabled={isSendingOtp}
                        className="text-[11px] font-bold text-(--rose) hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCw
                          size={11}
                          className={isSendingOtp ? "animate-spin" : ""}
                        />
                        <span>Resend Code</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        setOtpError("");
                        setOtp(e.target.value.replace(/\D/g, ""));
                      }}
                      placeholder="123456"
                      className="w-full text-center tracking-[0.25em] font-mono text-sm font-bold py-1.5 px-3 rounded-xl border border-(--line) bg-(--surface) text-(--ink) outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyRegisterOtp}
                      disabled={isVerifyingOtp || otp.length < 4}
                      className="px-3.5 py-1.5 rounded-xl bg-(--rose) hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold transition shrink-0 cursor-pointer"
                    >
                      {isVerifyingOtp ? "Checking..." : "Confirm"}
                    </button>
                  </div>

                  {otpError && (
                    <p className="text-[11px] text-rose-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{otpError}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <TextField
              id="modal-register-password"
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={registerFormik.values.password}
              onChange={registerFormik.handleChange}
              onBlur={registerFormik.handleBlur}
              error={registerFormik.errors.password}
              touched={registerFormik.touched.password}
              required
              startAdornment={<Lock size={16} />}
            />

            <TextField
              id="modal-register-confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={registerFormik.values.confirmPassword}
              onChange={registerFormik.handleChange}
              onBlur={registerFormik.handleBlur}
              error={registerFormik.errors.confirmPassword}
              touched={registerFormik.touched.confirmPassword}
              required
              startAdornment={<Lock size={16} />}
            />

            <button
              type="submit"
              disabled={submitting || !isEmailVerified}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-(--rose) text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 cursor-pointer"
            >
              <span>
                {submitting ? "Registering..." : "Create Account & Sign In"}
              </span>
              <Check size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
