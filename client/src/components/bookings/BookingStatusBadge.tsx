import React from "react";
import type { BookingStatus } from "@/redux/features/bookings/bookings.types";

export interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  switch (status) {
    case "Pending":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 ${className}`}
        >
          <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
          <span>Pending</span>
        </span>
      );
    case "Confirmed":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 ${className}`}
        >
          <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Confirmed</span>
        </span>
      );
    case "Completed":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 ${className}`}
        >
          <span className="size-1.5 rounded-full bg-blue-500 shrink-0" />
          <span>Completed</span>
        </span>
      );
    case "Cancelled":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 ${className}`}
        >
          <span className="size-1.5 rounded-full bg-rose-500 shrink-0" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return null;
  }
};

export default BookingStatusBadge;
