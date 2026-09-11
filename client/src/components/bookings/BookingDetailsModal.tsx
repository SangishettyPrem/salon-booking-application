import React from "react";
import {
  X,
  User,
  Scissors,
  Calendar,
  CreditCard,
  Check,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { formatCurrency } from "@/utils";
import BookingStatusBadge from "./BookingStatusBadge";
import type {
  Booking,
  BookingStatus,
} from "@/redux/features/bookings/bookings.types";

export interface BookingDetailsModalProps {
  booking: Booking | null;
  onClose: () => void;
  onConfirm: (bookingId: string) => void;
  onCancel: (booking: Booking) => void;
  onUpdateStatus?: (bookingId: string, status: BookingStatus) => void;
}

const STATUS_LIST: { label: string; value: BookingStatus; desc: string }[] = [
  {
    label: "Pending",
    value: "Pending",
    desc: "Awaiting owner acceptance / review",
  },
  {
    label: "Confirmed",
    value: "Confirmed",
    desc: "Scheduled & confirmed appointment",
  },
  {
    label: "Completed",
    value: "Completed",
    desc: "Service successfully delivered",
  },
  {
    label: "Cancelled",
    value: "Cancelled",
    desc: "Appointment declined or cancelled",
  },
];

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  onClose,
  onConfirm,
  onCancel,
  onUpdateStatus,
}) => {
  if (!booking) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-details-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop click area */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div className="relative bg-(--surface) text-(--ink) border border-(--line) rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-(--line) pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-(--rose) bg-(--rose)/10 px-2.5 py-1 rounded-md">
              #{booking.bookingCode}
            </span>
            <h2
              id="booking-details-title"
              className="text-xl font-bold text-(--ink) mt-2"
            >
              Booking Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--soft) flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Details Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {/* Customer */}
          <div className="p-3 rounded-xl bg-(--paper) border border-(--line)">
            <div className="flex items-center gap-1.5 text-xs text-(--muted) font-semibold uppercase tracking-wider mb-1">
              <User size={13} />
              <span>Customer</span>
            </div>
            <p className="font-bold text-(--ink)">{booking.customerName}</p>
            <p className="text-xs text-(--muted) mt-0.5">
              {booking.customerPhone}
            </p>
          </div>

          {/* Service */}
          <div className="p-3 rounded-xl bg-(--paper) border border-(--line)">
            <div className="flex items-center gap-1.5 text-xs text-(--muted) font-semibold uppercase tracking-wider mb-1">
              <Scissors size={13} />
              <span>Service</span>
            </div>
            <p className="font-bold text-(--ink)">{booking.serviceName}</p>
            <p className="text-xs text-(--muted) mt-0.5">
              {booking.durationMinutes} mins duration
            </p>
          </div>

          {/* Date & Time */}
          <div className="p-3 rounded-xl bg-(--paper) border border-(--line)">
            <div className="flex items-center gap-1.5 text-xs text-(--muted) font-semibold uppercase tracking-wider mb-1">
              <Calendar size={13} />
              <span>Date & Time</span>
            </div>
            <p className="font-bold text-(--ink)">{booking.time}</p>
            <p className="text-xs text-(--muted) mt-0.5">{booking.date}</p>
          </div>

          {/* Staff Assigned */}
          <div className="p-3 rounded-xl bg-(--paper) border border-(--line)">
            <div className="flex items-center gap-1.5 text-xs text-(--muted) font-semibold uppercase tracking-wider mb-1">
              <User size={13} />
              <span>Staff Assigned</span>
            </div>
            <p className="font-bold text-(--ink)">{booking.staffName}</p>
            <p className="text-xs text-(--muted) mt-0.5">Stylist</p>
          </div>

          {/* Price & Payment */}
          <div className="p-3 rounded-xl bg-(--paper) border border-(--line)">
            <div className="flex items-center gap-1.5 text-xs text-(--muted) font-semibold uppercase tracking-wider mb-1">
              <CreditCard size={13} />
              <span>Price & Payment</span>
            </div>
            <p className="font-bold text-(--ink)">
              {formatCurrency(booking.price)}
            </p>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
              Payment: {booking.paymentStatus}
            </p>
          </div>

          {/* Status */}
          <div className="p-3 rounded-xl bg-(--paper) border border-(--line)">
            <div className="text-xs text-(--muted) font-semibold uppercase tracking-wider mb-1.5">
              Current Status
            </div>
            <div>
              <BookingStatusBadge status={booking.status} />
            </div>
          </div>
        </div>

        {/* Update Status Selector Section */}
        {booking.status === "Completed" ? (
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-2.5 text-xs text-blue-700 dark:text-blue-400 font-medium">
            <CheckCircle2
              size={16}
              className="shrink-0 text-blue-600 dark:text-blue-400"
            />
            <span>
              This booking is marked as <strong>Completed</strong> and
              finalized. Status cannot be modified.
            </span>
          </div>
        ) : (
          onUpdateStatus && (
            <div className="p-4 rounded-2xl bg-(--soft)/40 border border-(--line) space-y-2">
              <label
                htmlFor="modal-status-select"
                className="text-xs font-bold text-(--ink) flex items-center justify-between"
              >
                <span>Change Appointment Status:</span>
                <span className="text-[10px] text-(--muted) font-normal">
                  Updates in real-time
                </span>
              </label>
              {booking.status === "Cancelled" ? (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-400 font-medium">
                  <X
                    size={16}
                    className="shrink-0 text-rose-600 dark:text-rose-400"
                  />
                  <span>
                    This booking is marked as <strong>Cancelled</strong> and
                    finalized. Status cannot be modified.
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    id="modal-status-select"
                    value={booking.status}
                    onChange={(e) =>
                      onUpdateStatus(
                        booking._id,
                        e.target.value as BookingStatus,
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-(--line) bg-(--paper) px-3.5 py-2.5 text-xs font-semibold text-(--ink) outline-none transition cursor-pointer pr-8"
                  >
                    {STATUS_LIST.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label} — {s.desc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-(--muted)"
                  />
                </div>
              )}
            </div>
          )
        )}

        {/* Modal Actions */}
        <div className="border-t border-(--line) pt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {booking.status === "Pending" && (
              <button
                type="button"
                onClick={() => onConfirm(booking._id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <Check size={14} />
                <span>Confirm</span>
              </button>
            )}

            {booking.status === "Confirmed" && onUpdateStatus && (
              <button
                type="button"
                onClick={() => onUpdateStatus(booking._id, "Completed")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>Mark Completed</span>
              </button>
            )}

            {booking.status !== "Cancelled" &&
              booking.status !== "Completed" && (
                <button
                  type="button"
                  onClick={() => onCancel(booking)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <XCircle size={14} />
                  <span>Cancel</span>
                </button>
              )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-(--line) bg-(--soft) hover:bg-(--line)/40 text-xs font-semibold text-(--ink) transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
