import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { MapPin, CalendarX2, ArrowRight, User, LogIn } from "lucide-react";
import { formatCurrency } from "@/utils";
import SectionHeading from "@/components/common/SectionHeading";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import { handleSuccess, handleError } from "@/utils/handleResponse";
import {
  cancelBooking,
  getCustomerBookings,
} from "@/redux/features/bookings/bookings.slice";
import Error from "@/components/common/Error";
import Skeletons from "@/components/common/Skeletons";
import type { Booking } from "@/redux/features/bookings/bookings.types";

const CustomerBookings: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { bookings, bookingsError, isBookingsLoading, isBookingsFetched } =
    useAppSelector((state) => state.bookings);
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "completed" | "cancelled"
  >("upcoming");
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  const loadCustomerBookings = useCallback(async () => {
    try {
      await dispatch(getCustomerBookings());
    } catch {}
  }, [dispatch]);

  useEffect(() => {
    if (!user || isBookingsFetched) return;
    loadCustomerBookings();
  }, [user]);

  // Filtered by tab
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (activeTab === "upcoming") {
        return b.status === "Confirmed" || b.status === "Pending";
      }
      if (activeTab === "completed") {
        return b.status === "Completed";
      }
      return b.status === "Cancelled";
    });
  }, [bookings, activeTab]);

  const handleCancelBooking = async () => {
    if (!bookingToCancel || !user) return;
    try {
      await dispatch(cancelBooking(bookingToCancel._id)).unwrap();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      handleSuccess("Appointment cancelled successfully.");
    } catch (error: any) {
      handleError(error || "Failed to cancel appointment.");
    } finally {
      setBookingToCancel(null);
    }
  };

  // 1. UNLOGGED / GUEST STATE
  if (!user) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8 pb-24 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-(--surface) border border-(--line) space-y-5 shadow-xl max-w-lg mx-auto">
          <div className="size-16 mx-auto rounded-3xl bg-(--rose)/10 text-(--rose) flex items-center justify-center font-bold shadow-inner">
            <User size={32} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-(--rose)">
              Account Required
            </span>
            <h1 className="text-2xl font-extrabold text-(--ink) tracking-tight">
              Sign In to View Your Bookings
            </h1>
            <p className="text-xs sm:text-sm text-(--muted) leading-relaxed">
              Please log in to your customer account to view your scheduled
              visits, track appointment status, and manage past salon receipts.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              state={{ from: "/bookings" }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-(--rose) text-white text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity shadow-md cursor-pointer"
            >
              <LogIn size={16} />
              <span>Log In to Your Account</span>
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-(--line) bg-(--soft) hover:bg-(--line)/40 text-xs sm:text-sm font-bold text-(--ink) transition-colors cursor-pointer"
            >
              <span>Create Free Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. LOGGED IN USER VIEW
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-8 pb-24">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--line) pb-4">
        <SectionHeading
          title="My Appointments"
          description={`Logged in as ${user.name} (${user.email})`}
        />
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-(--rose) text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-xs shrink-0 self-start sm:self-auto"
        >
          <span>Explore Salons</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* 2. Tabs */}
      {bookings.length > 0 && (
        <div className="flex items-center gap-2 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "upcoming"
                ? "bg-(--rose) text-white shadow-xs"
                : "bg-(--soft) text-(--muted) hover:text-(--ink)"
            }`}
          >
            Upcoming (
            {
              bookings.filter(
                (b) => b.status === "Confirmed" || b.status === "Pending",
              ).length
            }
            )
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "completed"
                ? "bg-(--rose) text-white shadow-xs"
                : "bg-(--soft) text-(--muted) hover:text-(--ink)"
            }`}
          >
            Completed ({bookings.filter((b) => b.status === "Completed").length}
            )
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cancelled")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "cancelled"
                ? "bg-(--rose) text-white shadow-xs"
                : "bg-(--soft) text-(--muted) hover:text-(--ink)"
            }`}
          >
            Cancelled ({bookings.filter((b) => b.status === "Cancelled").length}
            )
          </button>
        </div>
      )}

      {isBookingsLoading ? (
        <Skeletons />
      ) : bookingsError ? (
        <Error
          title="Bookings"
          handleRefetch={loadCustomerBookings}
          error={bookingsError}
        />
      ) : filteredBookings.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-(--surface) border border-(--line) p-8 space-y-3">
          <div className="size-14 mx-auto rounded-2xl bg-(--soft) flex items-center justify-center text-(--muted)">
            <CalendarX2 size={26} />
          </div>
          <h3 className="text-lg font-bold text-(--ink)">
            No {activeTab} appointments
          </h3>
          <p className="text-xs sm:text-sm text-(--muted) max-w-sm mx-auto">
            {activeTab === "upcoming"
              ? "You don't have any scheduled appointments. Discover top salons nearby."
              : `You have no ${activeTab} visits recorded.`}
          </p>
          {activeTab === "upcoming" && (
            <Link
              to="/"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--rose) text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              <span>Book an Appointment</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b._id}
              className="p-5 sm:p-6 rounded-3xl bg-(--surface) border border-(--line) shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-(--rose)/40 transition-all"
            >
              {/* Left Details */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-(--rose) bg-(--rose)/10 px-2.5 py-0.5 rounded-md">
                    #{b.bookingCode}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      b.status === "Confirmed"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                        : b.status === "Completed"
                          ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                          : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {b.status}
                  </span>
                  <span className="text-[11px] font-medium text-(--muted)">
                    {b.paymentStatus}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-(--ink)">
                    {b.salonName}
                  </h3>
                  <p className="text-xs text-(--muted) flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-(--rose) shrink-0" />
                    <span>{b.salonAddress}</span>
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-(--paper) border border-(--line) flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-(--muted) text-[10px] uppercase font-bold block">
                      Services
                    </span>
                    <span className="font-bold text-(--ink)">
                      {b.serviceName}
                    </span>
                  </div>
                  <div>
                    <span className="text-(--muted) text-[10px] uppercase font-bold block">
                      Specialist
                    </span>
                    <span className="font-medium text-(--ink)">
                      {b.staffName}
                    </span>
                  </div>
                  <div>
                    <span className="text-(--muted) text-[10px] uppercase font-bold block">
                      Schedule
                    </span>
                    <span className="font-bold text-(--rose)">
                      {b.date} at {b.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Price & Actions */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-(--line)">
                <div className="text-left md:text-right">
                  <span className="text-[10px] uppercase font-bold text-(--muted) block">
                    Amount Paid
                  </span>
                  <span className="text-xl font-extrabold text-(--ink)">
                    {formatCurrency(b.price)}
                  </span>
                </div>

                {activeTab === "upcoming" && (
                  <button
                    type="button"
                    onClick={() => setBookingToCancel(b)}
                    className="px-4 py-2 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                )}

                {activeTab === "completed" && (
                  <Link
                    to="/"
                    className="px-4 py-2 rounded-xl bg-(--soft) hover:bg-(--rose) hover:text-white text-(--ink) text-xs font-bold transition-colors"
                  >
                    Book Again
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Cancellation Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(bookingToCancel)}
        title="Cancel Appointment?"
        description={
          bookingToCancel ? (
            <span>
              Are you sure you want to cancel your appointment at{" "}
              <strong className="text-(--ink)">
                {bookingToCancel.salonName}
              </strong>{" "}
              on {bookingToCancel.date} at {bookingToCancel.time}? Any online
              payment will be processed for refund per salon policy.
            </span>
          ) : undefined
        }
        confirmText="Cancel Appointment"
        cancelText="Keep Appointment"
        variant="danger"
        onClose={() => setBookingToCancel(null)}
        onConfirm={handleCancelBooking}
      />
    </div>
  );
};

export default CustomerBookings;
