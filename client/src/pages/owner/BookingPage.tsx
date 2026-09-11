import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Calendar,
  Search,
  CheckCircle2,
  Clock3,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import SummaryCard from "@/components/common/dashboard/SummaryCard";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import BookingsTable from "@/components/bookings/BookingsTable";
import BookingDetailsModal from "@/components/bookings/BookingDetailsModal";
import { handleError, handleSuccess } from "@/utils/handleResponse";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import {
  getOwnerBookings,
  updateBookingStatus,
} from "@/redux/features/bookings/bookings.slice";
import Skeletons from "@/components/common/Skeletons";
import Error from "@/components/common/Error";
import type {
  Booking,
  BookingStatus,
} from "@/redux/features/bookings/bookings.types";

const ITEMS_PER_PAGE = 6;

const BookingPage: React.FC = () => {
  // Redux state
  const dispatch = useAppDispatch();
  const {
    bookings,
    bookingsError,
    isBookingsFetched,
    isBookingsLoading,
    bookingSummary,
  } = useAppSelector((state) => state.bookings);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  // Load Owner Bookings from backend
  const loadBookings = useCallback(async () => {
    try {
      await dispatch(getOwnerBookings()).unwrap();
    } catch {}
  }, [dispatch]);

  useEffect(() => {
    if (isBookingsFetched) return;
    loadBookings();
  }, [isBookingsFetched, loadBookings]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        booking.customerName.toLowerCase().includes(query) ||
        booking.bookingCode.toLowerCase().includes(query) ||
        booking.serviceName.toLowerCase().includes(query) ||
        booking.staffName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  // Reset to first page whenever search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedBookings = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  const startRecord =
    filteredBookings.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endRecord = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredBookings.length,
  );

  // Pagination page numbers generator with ellipsis
  const paginationRange = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  // Action: Generic Update Status
  const handleUpdateStatus = useCallback(
    async (bookingId: string, status: BookingStatus) => {
      const currentBooking = bookings.find((b) => b._id === bookingId);
      if (currentBooking?.status === "Completed") {
        handleError(
          "Completed appointments are finalized and cannot be modified.",
        );
        return;
      }

      if (status === "Cancelled") {
        if (currentBooking) {
          setBookingToCancel(currentBooking);
          return;
        }
      }
      try {
        await dispatch(updateBookingStatus({ bookingId, status })).unwrap();
        setSelectedBooking((prev) =>
          prev && prev._id === bookingId ? { ...prev, status } : prev,
        );
        handleSuccess(`Appointment marked as ${status}.`);
      } catch (err: any) {
        handleError(
          typeof err === "string"
            ? err
            : `Failed to update appointment to ${status}.`,
        );
      }
    },
    [dispatch, bookings],
  );

  // Action: Confirm Booking
  const handleConfirmBooking = useCallback(
    async (bookingId: string) => {
      await handleUpdateStatus(bookingId, "Confirmed");
    },
    [handleUpdateStatus],
  );

  // Action: Cancel Booking (via Confirmation Modal)
  const handleCancelBooking = useCallback(async () => {
    if (!bookingToCancel) return;
    const targetId = bookingToCancel._id;

    try {
      await dispatch(
        updateBookingStatus({ bookingId: targetId, status: "Cancelled" }),
      ).unwrap();
      setSelectedBooking((prev) =>
        prev && prev._id === targetId ? { ...prev, status: "Cancelled" } : prev,
      );
      handleSuccess("Appointment has been cancelled.");
    } catch (err: any) {
      handleError(
        typeof err === "string" ? err : "Failed to cancel appointment.",
      );
    } finally {
      setBookingToCancel(null);
    }
  }, [bookingToCancel, dispatch]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
  };

  // Keyboard accessibility: Close modals on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (bookingToCancel) {
          setBookingToCancel(null);
        } else if (selectedBooking) {
          setSelectedBooking(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bookingToCancel, selectedBooking]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6 sm:space-y-8">
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER                                                            */}
      {/* ========================================================================= */}
      <SectionHeading
        title="Bookings"
        description="Manage your salon appointments."
      />

      {/* ========================================================================= */}
      {/* 2. SUMMARY CARDS                                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Today's Bookings */}
        <SummaryCard
          icon={<Calendar size={22} />}
          label="Total Bookings"
          value={bookingSummary?.totalBookings ?? 0}
        />
        <SummaryCard
          icon={<Clock3 size={22} />}
          label="Confirmed Bookings"
          value={bookingSummary?.confirmedCount ?? 0}
        />
        <SummaryCard
          icon={<CheckCircle2 size={22} />}
          label="Completed Bookings"
          value={bookingSummary?.completedCount ?? 0}
        />
        <SummaryCard
          icon={<CheckCircle2 size={22} />}
          label="Total Amount"
          value={bookingSummary?.totalRevenue ?? 0}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. SEARCH AND FILTER CONTROLS                                             */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-(--surface) border border-(--line) flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--muted)">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer or booking..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-(--paper) border border-(--line) text-sm text-(--ink) focus:outline-none focus:ring-2 focus:ring-(--rose) transition-all"
            aria-label="Search customer or booking"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-(--muted) hover:text-(--ink) transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Filter & Clear */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-40 flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl bg-(--paper) border border-(--line) text-sm font-medium text-(--ink) focus:outline-none focus:ring-2 focus:ring-(--rose) cursor-pointer transition-all"
              aria-label="Filter bookings by status"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-(--muted)">
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {(searchQuery || statusFilter !== "All") && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-(--line) bg-(--soft) text-(--muted) hover:text-(--ink) text-xs font-semibold transition-colors shrink-0 cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOOKINGS LIST (Desktop Table + Mobile Cards)                            */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-(--surface) border border-(--line) overflow-hidden">
        {/* Container Header */}
        <div className="px-5 py-4 border-b border-(--line) flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-(--ink)">
              Bookings Overview
            </h2>
            <p className="text-xs text-(--muted) mt-0.5">
              Showing {filteredBookings.length} total appointment
              {filteredBookings.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {isBookingsLoading ? (
          <Skeletons />
        ) : bookingsError ? (
          <Error
            title="Bookings"
            handleRefetch={loadBookings}
            error={bookingsError}
          />
        ) : filteredBookings.length === 0 ? (
          <div className="py-12 px-4 sm:px-5 text-center">
            <div className="size-16 mx-auto rounded-2xl bg-(--soft) border border-(--line) flex items-center justify-center text-(--muted) mb-4">
              {searchQuery || statusFilter !== "All" ? (
                <Search size={32} />
              ) : (
                <Calendar size={32} />
              )}
            </div>
            <h3 className="text-xl font-bold text-(--ink)">
              {searchQuery || statusFilter !== "All"
                ? "No Matching Bookings Found"
                : "No Bookings Yet"}
            </h3>
            <p className="text-sm text-(--muted) max-w-md mx-auto mt-1">
              {searchQuery || statusFilter !== "All"
                ? "Try adjusting your search or filters to see different results."
                : "Your salon appointments and customer bookings will appear here once they are made."}
            </p>
            {(searchQuery || statusFilter !== "All") && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--rose) text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table & Mobile Cards */}
            <BookingsTable
              bookings={paginatedBookings}
              onViewDetails={setSelectedBooking}
              onUpdateStatus={handleUpdateStatus}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-(--line) bg-(--soft)/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Range summary */}
                <p className="text-xs sm:text-sm text-(--muted)">
                  Showing{" "}
                  <span className="font-semibold text-(--ink)">
                    {startRecord}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-(--ink)">
                    {endRecord}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-(--ink)">
                    {filteredBookings.length}
                  </span>{" "}
                  results
                </p>

                {/* Page Navigation */}
                <div className="flex items-center gap-1.5">
                  {/* First Page */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    aria-label="First page"
                    title="First page"
                    className="p-2 rounded-lg border border-(--line) bg-(--paper) text-(--ink) disabled:opacity-30 hover:bg-(--soft) transition-colors cursor-pointer"
                  >
                    <ChevronsLeft size={16} />
                  </button>

                  {/* Previous Page */}
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    title="Previous page"
                    className="p-2 rounded-lg border border-(--line) bg-(--paper) text-(--ink) disabled:opacity-30 hover:bg-(--soft) transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {paginationRange.map((page, index) => {
                      if (page === "...") {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 py-1 text-xs text-(--muted) select-none"
                          >
                            ...
                          </span>
                        );
                      }

                      const pageNum = Number(page);
                      const isActive = currentPage === pageNum;

                      return (
                        <button
                          key={`page-${pageNum}`}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          aria-current={isActive ? "page" : undefined}
                          className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? "bg-(--rose) text-white shadow-xs"
                              : "border border-(--line) bg-(--paper) text-(--ink) hover:bg-(--soft)"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Page */}
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                    title="Next page"
                    className="p-2 rounded-lg border border-(--line) bg-(--paper) text-(--ink) disabled:opacity-30 hover:bg-(--soft) transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Last Page */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    aria-label="Last page"
                    title="Last page"
                    className="p-2 rounded-lg border border-(--line) bg-(--paper) text-(--ink) disabled:opacity-30 hover:bg-(--soft) transition-colors cursor-pointer"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. BOOKING DETAILS MODAL / DIALOG                                         */}
      {/* ========================================================================= */}
      <BookingDetailsModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onConfirm={handleConfirmBooking}
        onCancel={setBookingToCancel}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* ========================================================================= */}
      {/* 6. CANCEL CONFIRMATION DIALOG                                             */}
      {/* ========================================================================= */}
      <ConfirmationModal
        isOpen={Boolean(bookingToCancel)}
        title="Cancel Booking?"
        description={
          bookingToCancel ? (
            <>
              Are you sure you want to cancel booking{" "}
              <span className="font-semibold text-(--ink)">
                #{bookingToCancel.bookingCode}
              </span>{" "}
              for{" "}
              <span className="font-semibold text-(--ink)">
                {bookingToCancel.customerName}
              </span>
              ?
            </>
          ) : undefined
        }
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        variant="danger"
        onClose={() => setBookingToCancel(null)}
        onConfirm={() => {
          if (bookingToCancel) handleCancelBooking();
        }}
      />
    </div>
  );
};

export default BookingPage;
