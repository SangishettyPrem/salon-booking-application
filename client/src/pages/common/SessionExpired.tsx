import React from "react";
import { LogOut, ArrowRight, ShieldAlert } from "lucide-react";
import { logout } from "@/redux/features/auth/auth.slice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";

const SessionExpired: React.FC = () => {
  const { sessionExpired } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  if (!sessionExpired) return null;

  const handleClose = async () => {
    await dispatch(logout());
    window.location.href = "/login";
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-(--surface) border border-(--line) rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Glow Accent */}
        <div
          className="absolute -top-12 -right-12 w-36 h-36 bg-(--rose)/15 rounded-full blur-2xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Icon & Message */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="size-16 rounded-2xl bg-(--rose)/10 border border-(--rose)/20 text-(--rose) flex items-center justify-center mb-3 shadow-xs">
            <ShieldAlert size={32} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-2">
            Authentication Needed
          </span>

          <h2
            id="session-expired-title"
            className="text-xl sm:text-2xl font-bold text-(--ink) tracking-tight"
          >
            Session Expired
          </h2>

          <p className="text-xs sm:text-sm text-(--muted) leading-relaxed mt-2 max-w-xs">
            Your login session has expired for security reasons. Please log in
            again to continue your activities.
          </p>
        </div>

        {/* Action Button */}
        <div className="relative z-10 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3 px-5 rounded-xl bg-(--rose) hover:opacity-90 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-(--rose)/50"
          >
            <LogOut size={16} />
            <span>Login Again</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpired;
