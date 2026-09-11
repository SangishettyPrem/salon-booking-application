import { CircleAlert } from "lucide-react";

const BookingFailure = () => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 pb-24">
      {/* 1. Failure Hero Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-(--surface) border border-(--line) text-center space-y-4 shadow-xl relative overflow-hidden">
        {/* Decorative ambient ring */}
        <div className="size-20 mx-auto rounded-3xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-300">
          <CircleAlert size={44} strokeWidth={2.5} />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            Booking Confirmation Failed!
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-(--ink) tracking-tight">
            We couldn't confirm your booking.
          </h1>
          <p className="text-xs sm:text-sm text-(--muted) max-w-md mx-auto">
            We encountered an issue while creating your appointment. Please
            contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingFailure;
