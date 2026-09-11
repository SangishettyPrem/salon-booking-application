import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthPromoPanel from "@/components/common/AuthPromoPanel";
import { handleError, handleSuccess } from "@/utils/handleResponse";
import { useAppDispatch } from "@/redux/hooks/redux.hooks";
import { ForgotPassword } from "@/redux/features/auth/auth.slice";

const ForgotPasswordPage = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await dispatch(ForgotPassword(email)).unwrap();
      if (result.success) {
        setIsSuccess(true);
        return handleSuccess(
          result.message ?? "Password reset link has been sent to your email.",
        );
      } else {
        return handleError(result?.message ?? "Failed to Reset");
      }
    } catch (error: any) {
      return handleError(error ?? "Failed to Reset");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen flex">
      <AuthPromoPanel
        primary="Reset your glow in minutes."
        secondary="We’ll send a secure reset link so you can get back to your next salon appointment without the wait."
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
          {isSuccess && (
            <div className="mb-10 gap-1.25 text-[11px] font-semibold flex items-center uppercase text-(--ink) justify-center bg-green-300 p-5">
              <span>Password reset link has been sent to your email</span>
            </div>
          )}

          <span className="gap-1.5 text-[10px] font-bold uppercase tracking-[1.45px] text-(--rose)">
            account help
          </span>

          <h2 className="mt-2.5 mb-1.75 text-[30px] font-semibold tracking-[-1.1px] text-(--ink)">
            Forgot your password?
          </h2>

          <p className="mb-6.75 text-sm leading-[1.6] text-(--muted)">
            Enter your email address and we’ll send you a secure link to reset
            your password.
          </p>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-(--ink)"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3.5 size-4 text-(--muted)" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-(--line) bg-(--surface) py-3 pl-10 pr-3 text-sm text-(--ink) outline-none transition focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--rose)_13%,transparent)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !email.trim() || isSuccess}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[11px] border border-(--rose) bg-(--rose) px-4.5 py-3.25 text-sm font-bold text-white transition-transform duration-200 hover:-translate-y-px hover:border-(--rose-dark) hover:bg-(--rose-dark) disabled:cursor-not-allowed disabled:opacity-55"
            >
              {submitting ? "Sending…" : "Send reset link"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-(--muted)">
            Remembered your password?{" "}
            <Link className="font-bold text-(--rose)" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ForgotPasswordPage;
