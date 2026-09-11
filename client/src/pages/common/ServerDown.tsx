import React from "react";
import { RefreshCcw, ServerCrash, WifiOff } from "lucide-react";

const ServerDown: React.FC = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-(--paper) relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div
        className="absolute top-1/4 -left-24 w-96 h-96 bg-(--rose)/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Container Card */}
      <div className="w-full max-w-lg bg-(--surface) border border-(--line) rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6 relative z-10">
        {/* Status Badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
            <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Service Temporarily Offline</span>
          </span>
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="size-20 rounded-3xl bg-(--rose)/10 border border-(--rose)/20 text-(--rose) flex items-center justify-center shadow-xs">
            <ServerCrash size={40} className="stroke-[1.75]" />
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-(--ink) tracking-tight">
            Service Unavailable
          </h1>
          <p className="text-xs sm:text-sm text-(--muted) leading-relaxed max-w-sm mx-auto">
            We’re having trouble connecting to our servers right now. Please check your internet connection or try again in a moment.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-(--rose) hover:opacity-90 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-(--rose)/50"
          >
            <RefreshCcw size={16} />
            <span>Try Again</span>
          </button>
        </div>

        {/* Footer Note */}
        <div className="border-t border-(--line) pt-4 flex items-center justify-center gap-2 text-[11px] text-(--muted)">
          <WifiOff size={13} />
          <span>If the problem persists, our team is already investigating.</span>
        </div>
      </div>
    </div>
  );
};

export default ServerDown;
