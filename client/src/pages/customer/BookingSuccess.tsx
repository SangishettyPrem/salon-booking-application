import React from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/utils";

const BookingSuccess: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const booking = location.state?.booking;

  const displayBookingId = booking?.bookingCode || bookingId || "BK-109482";
  const displayDate = booking?.date || "2026-08-27";
  const displayTime = booking?.time || "10:30 AM";
  const displaySalonName = booking?.salonName || "Glow Luxury Salon & Spa";
  const displayAddress =
    booking?.salonAddress || "42, 100 Feet Road, Indiranagar, Bengaluru";
  const displayServices = booking?.serviceName || "Classic Haircut & Facial";
  const displayStylist = booking?.staffName || "Arjun Verma";
  const displayTotal = booking?.price ? formatCurrency(booking.price) : "₹785";

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 pb-24">
      {/* 1. Success Hero Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-(--surface) border border-(--line) text-center space-y-4 shadow-xl relative overflow-hidden">
        {/* Decorative ambient ring */}
        <div className="size-20 mx-auto rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-300">
          <CheckCircle2 size={44} strokeWidth={2.5} />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Booking Confirmed!
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-(--ink) tracking-tight">
            We've saved your chair.
          </h1>
          <p className="text-xs sm:text-sm text-(--muted) max-w-md mx-auto">
            Your appointment has been successfully scheduled. A confirmation
            email and SMS pass have been sent.
          </p>
        </div>

        {/* Booking Code Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-(--paper) border border-(--line) text-xs font-mono font-bold text-(--rose)">
          <span>Booking Ref: #{displayBookingId}</span>
        </div>
      </div>

      {/* 2. Digital Appointment Pass */}
      <div className="p-6 sm:p-8 rounded-3xl bg-(--surface) border border-(--line) shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-(--line) pb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-(--rose)">
              Appointment Pass
            </span>
            <h2 className="text-lg font-bold text-(--ink)">
              {displaySalonName}
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            Confirmed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-(--paper) border border-(--line) space-y-1">
            <span className="text-(--muted) text-[11px] block">
              Date & Time
            </span>
            <div className="flex items-center gap-1.5 font-bold text-(--ink) text-sm">
              <Calendar size={14} className="text-(--rose)" />
              <span>{displayDate}</span>
              <span>•</span>
              <Clock size={14} className="text-(--rose)" />
              <span>{displayTime}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-(--paper) border border-(--line) space-y-1">
            <span className="text-(--muted) text-[11px] block">Specialist</span>
            <div className="font-bold text-(--ink) text-sm flex items-center gap-1.5">
              <Sparkles size={14} className="text-(--rose)" />
              <span>{displayStylist}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-(--paper) border border-(--line) space-y-1">
            <span className="text-(--muted) text-[11px] block">Treatments</span>
            <div className="font-bold text-(--ink) text-sm">
              {displayServices}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-(--paper) border border-(--line) space-y-1">
            <span className="text-(--muted) text-[11px] block">
              Total Amount
            </span>
            <div className="font-extrabold text-(--rose) text-sm">
              {displayTotal}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-(--soft) border border-(--line) flex items-start gap-2.5 text-xs text-(--muted)">
          <MapPin size={16} className="text-(--rose) shrink-0 mt-0.5" />
          <div>
            <strong className="text-(--ink) block">Salon Address</strong>
            <span>{displayAddress}</span>
          </div>
        </div>
      </div>

      {/* 3. Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link
          to="/bookings"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-(--rose) text-white text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity shadow-md cursor-pointer"
        >
          <span>View My Bookings</span>
          <ArrowRight size={16} />
        </Link>

        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-(--line) bg-(--surface) hover:bg-(--soft) text-xs sm:text-sm font-bold text-(--ink) transition-colors cursor-pointer"
        >
          <span>Explore More Salons</span>
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccess;
