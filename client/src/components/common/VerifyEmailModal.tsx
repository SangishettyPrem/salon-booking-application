import React, { useState, useEffect } from "react";
import {
  MailCheck,
  RotateCw,
  LogOut,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import { SendOTP, VerifyOTP, logout } from "@/redux/features/auth/auth.slice";
import { handleSuccess } from "@/utils/handleResponse";

interface VerifyEmailModalProps {
  isOpen?: boolean;
}

const VerifyEmailModal: React.FC<VerifyEmailModalProps> = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [otp, setOtp] = useState<string>("");
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [hasSentInitial, setHasSentInitial] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Only show if user is authenticated and email is not verified
  const shouldShow = Boolean(isAuthenticated && user && !user.emailVerified);

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Automatically trigger OTP send on modal open
  useEffect(() => {
    if (shouldShow && user?.email && !hasSentInitial) {
      setHasSentInitial(true);
      handleSendOtp(user.email, true);
    }
  }, [shouldShow, user?.email, hasSentInitial]);

  const handleSendOtp = async (email: string, isInitial = false) => {
    try {
      setIsSendingOtp(true);
      setErrorMessage("");
      const result = await dispatch(SendOTP({ email })).unwrap();
      if (result.success) {
        setResendTimer(30);
        if (!isInitial) {
          handleSuccess("A new verification code has been sent to your email.");
        }
      } else {
        setErrorMessage(result.message ?? "Failed to send verification code.");
      }
    } catch (error: any) {
      setErrorMessage(error ?? "Failed to send verification code.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    if (!otp.trim() || otp.trim().length < 4) {
      setErrorMessage("Please enter a valid verification code.");
      return;
    }

    try {
      setIsVerifying(true);
      setErrorMessage("");
      const result = await dispatch(
        VerifyOTP({ email: user.email, otp: otp.trim() }),
      ).unwrap();
      if (result.success) {
        handleSuccess(result.message ?? "Email verified successfully!");
        await new Promise((resolve) => setTimeout(resolve, 500));
        window.location.reload();
      } else {
        setErrorMessage(result.message ?? "Invalid verification code.");
      }
    } catch (error: any) {
      setErrorMessage(error ?? "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await dispatch(logout()).unwrap();
      handleSuccess("Signed out successfully");
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  if (!shouldShow) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md rounded-3xl bg-(--surface) border border-(--line) p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow ambient accent */}
        <div
          className="absolute -top-12 -right-12 w-36 h-36 bg-(--rose)/10 rounded-full blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Modal Header */}
        <div className="text-center space-y-3">
          <div className="size-14 mx-auto rounded-2xl bg-(--rose)/10 text-(--rose) flex items-center justify-center border border-(--rose)/20 shadow-xs">
            <MailCheck size={28} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-(--rose)">
              Verification Required
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-(--ink) mt-0.5">
              Verify Your Email
            </h2>
          </div>
          <p className="text-xs text-(--muted) leading-relaxed">
            We sent a verification code to{" "}
            <strong className="text-(--ink) font-semibold">
              {user?.email}
            </strong>
            . Please enter the code below to continue using your account.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="modal-verification-otp"
              className="block text-xs font-bold text-(--ink) text-center"
            >
              Enter Verification Code (OTP)
            </label>
            <input
              id="modal-verification-otp"
              name="otp"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setErrorMessage("");
                setOtp(e.target.value.replace(/\D/g, ""));
              }}
              placeholder="123456"
              className="w-full text-center tracking-[0.4em] font-mono text-xl sm:text-2xl font-bold py-3 px-4 rounded-xl border border-(--line) bg-(--paper) text-(--ink) outline-none transition focus:ring-3 focus:ring-(--rose)/20"
              autoFocus
              autoComplete="one-time-code"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || otp.length < 4}
            className="w-full py-3 px-4 rounded-xl bg-(--rose) hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck size={16} />
            <span>{isVerifying ? "Verifying..." : "Verify & Continue"}</span>
          </button>
        </form>

        {/* Resend & Sign Out Controls */}
        <div className="space-y-3 pt-2 border-t border-(--line) text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-(--muted)">
            <span>Didn't receive the code?</span>
            {resendTimer > 0 ? (
              <span className="font-semibold text-(--ink)">
                Resend in {resendTimer}s
              </span>
            ) : (
              <button
                type="button"
                onClick={() => user?.email && handleSendOtp(user.email)}
                disabled={isSendingOtp}
                className="font-bold text-(--rose) hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCw
                  size={12}
                  className={isSendingOtp ? "animate-spin" : ""}
                />
                <span>{isSendingOtp ? "Sending..." : "Resend Code"}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="text-[11px] font-semibold text-(--muted) hover:text-rose-600 inline-flex items-center gap-1 transition cursor-pointer"
          >
            <LogOut size={12} />
            <span>Sign in with a different account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailModal;
