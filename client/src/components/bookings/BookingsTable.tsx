import React from "react";
import { formatCurrency } from "@/utils";
import {
  Calendar,
  Clock,
  Scissors,
  User,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import type {
  Booking,
  BookingStatus,
} from "@/redux/features/bookings/bookings.types";

export interface BookingsTableProps {
  bookings: Booking[];
  onViewDetails: (booking: Booking) => void;
  onUpdateStatus?: (bookingId: string, status: BookingStatus) => void;
}

const STATUS_OPTIONS: { label: string; value: BookingStatus; color: string }[] =
  [
    {
      label: "Pending",
      value: "Pending",
      color:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    },
    {
      label: "Confirmed",
      value: "Confirmed",
      color:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    },
    {
      label: "Completed",
      value: "Completed",
      color:
        "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
    },
    {
      label: "Cancelled",
      value: "Cancelled",
      color:
        "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
    },
  ];

const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  onViewDetails,
  onUpdateStatus,
}) => {
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "Pending":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
      case "Confirmed":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
      case "Completed":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30";
      case "Cancelled":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-(--soft) text-(--ink) border-(--line)";
    }
  };

  return (
    <>
      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-(--line) bg-(--soft)/40 text-(--muted) text-xs font-semibold uppercase tracking-wider">
              {[
                "Booking ID",
                "Time",
                "Customer",
                "Service",
                "Staff",
                "Status",
              ].map((header, index) => (
                <th key={index} className="py-3 px-5">
                  {header}
                </th>
              ))}
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--line)">
            {bookings.map((booking) => (
              <tr
                key={booking._id}
                className="hover:bg-(--soft)/40 transition-colors group"
              >
                <td className="py-3.5 px-5 font-bold text-xs text-(--rose) font-mono">
                  #{booking.bookingCode}
                </td>
                <td className="py-3.5 px-5 font-semibold text-(--ink)">
                  <div>{booking.time}</div>
                  <div className="text-[11px] font-normal text-(--muted)">
                    {booking.date}
                  </div>
                </td>
                <td className="py-3.5 px-5">
                  <div className="font-medium text-(--ink)">
                    {booking.customerName}
                  </div>
                  <div className="text-[11px] text-(--muted)">
                    {booking.customerPhone}
                  </div>
                </td>
                <td className="py-3.5 px-5 text-(--ink)">
                  <span className="line-clamp-1">{booking.serviceName}</span>
                </td>
                <td className="py-3.5 px-5 text-(--muted)">
                  {booking.staffName}
                </td>
                <td className="py-3.5 px-5">
                  {booking.status === "Completed" ||
                  booking.status === "Cancelled" ? (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                        booking.status,
                      )} border border-blue-500/30 select-none`}
                    >
                      <CheckCircle2 size={13} className="shrink-0" />
                      <span>{booking.status}</span>
                    </span>
                  ) : onUpdateStatus ? (
                    <div className="relative inline-block">
                      <select
                        value={booking.status}
                        onChange={(e) =>
                          onUpdateStatus(
                            booking._id,
                            e.target.value as BookingStatus,
                          )
                        }
                        className={`appearance-none text-xs font-semibold px-3 py-1.5 pr-7 rounded-full border cursor-pointer transition-all outline-none ${getStatusColor(
                          booking.status,
                        )}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            className="bg-(--surface) text-(--ink)"
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={13}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                      />
                    </div>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        booking.status,
                      )}`}
                    >
                      {booking.status}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-right">
                  <button
                    type="button"
                    onClick={() => onViewDetails(booking)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--line) bg-(--paper) hover:bg-(--soft) text-xs font-semibold text-(--ink) transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View: Cards */}
      <div className="block md:hidden divide-y divide-(--line)">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="p-4 space-y-3 hover:bg-(--soft)/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-(--rose) bg-(--rose)/10 px-2 py-0.5 rounded">
                #{booking.bookingCode}
              </span>
              {booking.status === "Completed" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30 select-none">
                  <CheckCircle2 size={12} className="shrink-0" />
                  <span>Completed</span>
                </span>
              ) : onUpdateStatus ? (
                <div className="relative inline-block">
                  <select
                    value={booking.status}
                    onChange={(e) =>
                      onUpdateStatus(
                        booking._id,
                        e.target.value as BookingStatus,
                      )
                    }
                    className={`appearance-none text-xs font-semibold px-3 py-1 pr-6 rounded-full border cursor-pointer transition-all outline-none ${getStatusColor(
                      booking.status,
                    )}`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-(--surface) text-(--ink)"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                  />
                </div>
              ) : (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(
                    booking.status,
                  )}`}
                >
                  {booking.status}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-(--ink)">
                <User size={13} className="text-(--muted) shrink-0" />
                <div className="truncate font-medium">
                  {booking.customerName}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-(--ink) justify-end">
                <Clock size={13} className="text-(--muted) shrink-0" />
                <span>{booking.time}</span>
              </div>
              <div className="flex items-center gap-1.5 text-(--muted)">
                <Scissors size={13} className="shrink-0" />
                <span className="truncate">{booking.serviceName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-(--muted) justify-end">
                <Calendar size={13} className="shrink-0" />
                <span>{booking.date}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-(--line)/50 text-xs">
              <span className="font-bold text-(--ink)">
                {formatCurrency(booking.price)}
              </span>
              <button
                type="button"
                onClick={() => onViewDetails(booking)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-(--line) bg-(--paper) hover:bg-(--soft) font-semibold text-(--ink) transition-colors shadow-2xs cursor-pointer"
              >
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default BookingsTable;
