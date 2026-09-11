import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthPromoPanel from "@/components/common/AuthPromoPanel";
import { handleError, handleSuccess } from "@/utils/handleResponse";
import { useFormik } from "formik";
import { ResetPasswordValidationSchema } from "@/validations/auth.validations";
import type { ResetPasswordState } from "@/redux/features/auth/auth.types";
import { useAppDispatch } from "@/redux/hooks/redux.hooks";
import { ResetPassword } from "@/redux/features/auth/auth.slice";

const initialValues: ResetPasswordState = {
  email: "",
  token: "",
  password: "",
  confirmPassword: "",
};

const ResetPasswordPage = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);

  const isValid = !token || !email;

  useEffect(() => {
    resetPasswordFormik.setValues({
      email,
      token,
      password: "",
      confirmPassword: "",
    });
  }, []);

  const resetPasswordFormik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: ResetPasswordValidationSchema,
    onSubmit: () => handleSubmit(),
  });

  const handleResetPasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isValid) {
      return handleError(
        "Invalid reset link. Please use the email link sent by GlowBook.",
      );
    }
    if (resetPasswordFormik.values.password.length < 8) {
      return handleError("Password must be at least 8 characters long.");
    }
    if (
      resetPasswordFormik.values.password !==
      resetPasswordFormik.values.confirmPassword
    ) {
      return handleError("Passwords do not match.");
    }
    resetPasswordFormik.submitForm();
  };

  const handleSubmit = async (): Promise<string | void> => {
    setSubmitting(true);
    try {
      const result = await dispatch(
        ResetPassword(resetPasswordFormik.values),
      ).unwrap();
      if (!result.success) {
        return handleError(result.message ?? "Unable to reset your password.");
      }
      handleSuccess("Your password has been reset successfully.");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      window.location.href = "/login";
      return;
    } catch (error: any) {
      return handleError(error ?? "Unable to reset your password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen flex">
      <AuthPromoPanel
        primary="Fresh start, softer glow."
        secondary="Create a new secure password and get right back to booking your next salon ritual."
      />

      <div className="flex w-full items-center justify-center bg-(--paper) px-6.25 py-12.5 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link
            className="mb-10 gap-1.25 text-[11px] font-semibold flex items-center uppercase text-(--ink)"
            to="/login"
          >
            <ArrowLeft size={14} />
            <span>Back to sign in</span>
          </Link>

          <span className="gap-1.5 text-[10px] font-bold uppercase tracking-[1.45px] text-(--rose)">
            secure access
          </span>

          <h2 className="mt-2.5 mb-1.75 text-[30px] font-semibold tracking-[-1.1px] text-(--ink)">
            Reset your password
          </h2>

          <p className="mb-6.75 text-sm leading-[1.6] text-(--muted)">
            {isValid
              ? "This reset link is missing a valid token. Please use the email link sent by GlowBook."
              : "Your reset link is valid. Please choose a new password below."}
          </p>

          <form onSubmit={handleResetPasswordSubmit} className="grid gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-(--ink)"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-4 size-4 text-(--muted)" />
                <input
                  id="email"
                  type={"email"}
                  name="email"
                  value={email}
                  readOnly
                  disabled={isValid}
                  required
                  className="w-full rounded-lg border border-(--line) bg-(--surface) py-3 pl-10 pr-10 text-sm text-(--ink) outline-none transition  focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--rose)_13%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-(--ink)"
              >
                New password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-4 size-4 text-(--muted)" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={resetPasswordFormik.values.password}
                  onChange={resetPasswordFormik.handleChange}
                  placeholder="At least 8 characters"
                  disabled={isValid}
                  required
                  className="w-full rounded-lg border border-(--line) bg-(--surface) py-3 pl-10 pr-10 text-sm text-(--ink) outline-none transition focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--rose)_13%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  aria-label="Show password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 p-1.5 text-(--muted)"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirmPassword"
                className="text-xs font-semibold text-(--ink)"
              >
                Confirm password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-4 size-4 text-(--muted)" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={resetPasswordFormik.values.confirmPassword}
                  onChange={resetPasswordFormik.handleChange}
                  placeholder="Re-enter your password"
                  disabled={isValid}
                  required
                  className="w-full rounded-lg border border-(--line) bg-(--surface) py-3 pl-10 pr-10 text-sm text-(--ink) outline-none transition focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--rose)_13%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  aria-label="Show confirm password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-2.5 p-1.5 text-(--muted)"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || isValid || !resetPasswordFormik.isValid}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[11px] border border-(--rose) bg-(--rose) px-4.5 py-3.25 text-sm font-bold text-white transition-transform duration-200 hover:-translate-y-px hover:border-(--rose-dark) hover:bg-(--rose-dark) disabled:cursor-not-allowed disabled:opacity-55"
            >
              {submitting ? "Resetting…" : "Reset password"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-(--muted)">
            Need a new reset link?{" "}
            <Link className="font-bold text-(--rose)" to="/forgot-password">
              Request again
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ResetPasswordPage;
