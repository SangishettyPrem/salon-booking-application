import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
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
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import * as authSlice from "@/redux/features/auth/auth.slice";
import { handleError, handleSuccess } from "@/utils/handleResponse";
import AuthPromoPanel from "@/components/common/AuthPromoPanel";
import TextField from "@/components/common/TextField";

type AuthPageProps = {
  mode?: "login" | "register";
};

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

const AuthPage = ({ mode = "login" }: AuthPageProps) => {
  const isLogin = mode === "login";
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isInitializing } = useAppSelector(
    (state) => state.auth,
  );
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

  // OTP Countdown Timer
  useEffect(() => {
    let interval: any;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // If already authenticated and verified, redirect to destination
  useEffect(() => {
    if (!isInitializing && isAuthenticated && user && user.emailVerified) {
      if (user.role === "owner") {
        navigate("/owner", { replace: true });
      } else {
        const redirectUrl =
          (location.state as any)?.from ||
          new URLSearchParams(location.search).get("returnUrl") ||
          (sessionStorage.getItem("glowbook_checkout") ? "/checkout" : "/");
        navigate(redirectUrl, { replace: true });
      }
    }
  }, [isAuthenticated, isInitializing, user, navigate, location]);

  const loginFormik = useFormik({
    initialValues: loginInitialValues,
    validationSchema: LoginValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => await handleLogin(values),
  });

  const registerFormik = useFormik({
    initialValues: registerInitialValues,
    validationSchema: RegisterValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => await handleRegister(values),
  });

  // Send OTP for Register
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

  // Verify OTP for Register
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

  const handleLogin = async (values: LoginState) => {
    try {
      setSubmitting(true);
      const { success, message, user } = await dispatch(
        authSlice.Login(values),
      ).unwrap();
      if (success) {
        handleSuccess("Login successful!");
        if (user.role === "owner") {
          navigate("/owner", { replace: true });
          return;
        }
        const redirectUrl =
          (location.state as any)?.from ||
          new URLSearchParams(location.search).get("returnUrl") ||
          (sessionStorage.getItem("glowbook_checkout") ? "/checkout" : "/");
        navigate(redirectUrl, { replace: true });
      } else {
        return handleError(message ?? "Failed to Login");
      }
    } catch (error: any) {
      return handleError(error ?? "Failed to Login");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (values: RegisterState) => {
    if (!isEmailVerified) {
      return handleError(
        "Please verify your email address before creating an account.",
      );
    }

    try {
      setSubmitting(true);
      const result = await dispatch(authSlice.Register(values)).unwrap();
      if (result.success) {
        handleSuccess(result.message ?? "Account created successfully!");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        window.location.href = "/login";
      } else {
        return handleError(result.message ?? "Failed to Register");
      }
    } catch (error: any) {
      return handleError(error ?? "Failed to Register");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = await loginFormik.validateForm();
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      return handleError(firstError);
    }
    await loginFormik.submitForm();
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = await registerFormik.validateForm();
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      return handleError(firstError);
    }
    if (!isEmailVerified) {
      return handleError(
        "Please verify your email address before creating an account.",
      );
    }
    await registerFormik.submitForm();
  };

  return (
    <section className="min-h-screen flex">
      {/* Auth Promotional Section */}
      <AuthPromoPanel
        primary={
          isLogin
            ? "Welcome back to your best self."
            : "Your next glow starts here."
        }
        secondary="Find your favourite beauty and grooming professionals, all in one beautiful place."
      />

      {/* Auth Form Section */}
      <div className="flex items-center bg-(--paper) justify-center px-6 py-12 w-full lg:w-1/2">
        <div className="flex flex-col w-full max-w-md">
          {/* Back To Home Section */}
          <Link
            className="mb-8 gap-1.5 text-xs font-bold text-(--muted) hover:text-(--rose) flex items-center uppercase tracking-wider transition-colors w-fit"
            to="/"
          >
            <ArrowLeft size={14} />
            <span>Back to home</span>
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-wider text-(--rose)">
            {isLogin ? "welcome back" : "create an account"}
          </span>

          <h1 className="mt-1.5 mb-1 text-2xl sm:text-3xl font-extrabold text-(--ink) tracking-tight">
            {isLogin ? "Sign in to GlowBook" : "Let’s get to know you"}
          </h1>

          <p className="mb-6 text-xs sm:text-sm text-(--muted) leading-relaxed">
            {isLogin
              ? "Enter your details to see your upcoming moments."
              : "Book appointments, save favourites and get special perks."}
          </p>

          <form
            onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit}
            className="space-y-4"
          >
            {isLogin ? (
              <div className="space-y-4">
                {/* Login Email */}
                <TextField
                  id="login-email"
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

                {/* Login Password */}
                <TextField
                  id="login-password"
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-(--muted) hover:text-(--ink) transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Full Name */}
                <TextField
                  id="register-name"
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

                {/* Phone Number */}
                <TextField
                  id="register-phone"
                  name="phone"
                  label="Phone Number"
                  type="tel"
                  inputMode="tel"
                  maxLength={10}
                  placeholder="10-digit phone number"
                  value={registerFormik.values.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    registerFormik.setFieldValue("phone", value);
                  }}
                  onBlur={registerFormik.handleBlur}
                  error={registerFormik.errors.phone}
                  touched={registerFormik.touched.phone}
                  required
                  startAdornment={<Phone size={16} />}
                />

                {/* Role Selector */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="register-role"
                    className="text-xs font-semibold text-(--ink)"
                  >
                    I’m joining as <span className="text-(--rose)">*</span>
                  </label>
                  <select
                    id="register-role"
                    name="role"
                    value={registerFormik.values.role}
                    onChange={registerFormik.handleChange}
                    className="w-full rounded-lg border border-(--line) bg-(--surface) px-3.5 py-3 text-sm text-(--ink) outline-none transition focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--rose)_13%,transparent)]"
                  >
                    <option value="customer">
                      A Customer (Book appointments)
                    </option>
                    <option value="owner">
                      A Salon Owner (Manage salon & staff)
                    </option>
                  </select>
                </div>

                {/* Email Address with Verification Button */}
                <div className="space-y-2">
                  <TextField
                    id="register-email"
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
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
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
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
                          className="text-[11px] font-bold text-(--rose) hover:text-(--rose-dark) bg-(--soft) hover:bg-(--line)/50 disabled:opacity-50 px-2.5 py-1 rounded-lg border border-(--line) transition cursor-pointer shrink-0"
                        >
                          {isSendingOtp ? "Sending..." : "Verify Email"}
                        </button>
                      )
                    }
                  />

                  {/* Inline OTP Verification Panel */}
                  {!isEmailVerified && showOtpInput && (
                    <div className="p-4 rounded-2xl bg-(--soft) border border-(--line) space-y-3 animate-in fade-in duration-200">
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
                          className="w-full text-center tracking-[0.3em] font-mono text-base font-bold py-2 px-3 rounded-xl border border-(--line) bg-(--surface) text-(--ink) outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyRegisterOtp}
                          disabled={isVerifyingOtp || otp.length < 4}
                          className="px-4 py-2 rounded-xl bg-(--rose) hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold transition shrink-0 cursor-pointer"
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

                {/* Password */}
                <TextField
                  id="register-password"
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={registerFormik.values.password}
                  onChange={registerFormik.handleChange}
                  onBlur={registerFormik.handleBlur}
                  error={registerFormik.errors.password}
                  touched={registerFormik.touched.password}
                  required
                  startAdornment={<Lock size={16} />}
                  endAdornment={
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-(--muted) hover:text-(--ink) transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-(--rose) hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || (!isLogin && !isEmailVerified)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-(--rose) bg-(--rose) px-4.5 py-3.25 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-55 shadow-xs cursor-pointer"
            >
              {submitting
                ? "Please wait…"
                : isLogin
                  ? "Sign in"
                  : "Create my account"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-6 text-center text-xs sm:text-sm text-(--muted)">
            {isLogin ? "New to GlowBook?" : "Already have an account?"}{" "}
            <Link
              className="font-bold text-(--rose) hover:underline"
              to={isLogin ? "/register" : "/login"}
            >
              {isLogin ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default AuthPage;
