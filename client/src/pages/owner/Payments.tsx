import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  CreditCard,
  Search,
  RotateCcw,
  Receipt,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { formatCurrency } from "@/utils";
import SectionHeading from "@/components/common/SectionHeading";
import PaymentDetailsModal from "@/components/payments/PaymentDetailsModal";

import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import { getOwnerPayments } from "@/redux/features/payment/payment.slice";
import Skeletons from "@/components/common/Skeletons";
import Error from "@/components/common/Error";
import type {
  PaymentStatus,
  PaymentTransaction,
} from "@/redux/features/payment/payment.types";

const ITEMS_PER_PAGE = 6;

const Payments: React.FC = () => {
  const dispatch = useAppDispatch();
  const { payments, paymentsError, isPaymentsFetched, isPaymentsLoading } =
    useAppSelector((state) => state.payment);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [methodFilter, setMethodFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<PaymentTransaction | null>(null);

  // Load Owner Payments from Live Backend via Redux
  const loadPayments = useCallback(async () => {
    try {
      await dispatch(getOwnerPayments()).unwrap();
    } catch {}
  }, [dispatch]);

  useEffect(() => {
    if (isPaymentsFetched) return;
    loadPayments();
  }, [isPaymentsFetched, loadPayments]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return payments.filter((tx) => {
      const matchesStatus =
        statusFilter === "All" || tx.status === statusFilter;
      const matchesMethod =
        methodFilter === "All" || tx.method === methodFilter;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        tx.transactionCode?.toLowerCase().includes(query) ||
        tx.bookingCode?.toLowerCase().includes(query) ||
        tx.customerName?.toLowerCase().includes(query) ||
        tx.serviceName?.toLowerCase().includes(query);

      return matchesStatus && matchesMethod && matchesSearch;
    });
  }, [payments, statusFilter, methodFilter, searchQuery]);

  // Reset to first page whenever search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, methodFilter]);

  // Pagination calculation
  const totalPages =
    Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedTransactions = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const startRecord =
    filteredTransactions.length === 0
      ? 0
      : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endRecord = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredTransactions.length,
  );

  // Pagination range generator with ellipsis
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

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setMethodFilter("All");
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "Pending":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case "Failed":
      default:
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
    }
  };

  // Keyboard accessibility: Close modals on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedTransaction) {
        setSelectedTransaction(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTransaction]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6 sm:space-y-8">
      {/* 1. Header */}
      <SectionHeading
        title="Payments & Transactions"
        description="Monitor settled customer earnings, payment methods, and invoices."
      />

      {/* 2. Search & Filters Bar */}
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
            placeholder="Search by txn code, customer, or service..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-(--paper) border border-(--line) text-sm text-(--ink) focus:outline-none focus:ring-2 focus:ring-(--rose) transition-all"
            aria-label="Search transactions"
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

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-36 flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-xl bg-(--paper) border border-(--line) text-xs font-semibold text-(--ink) focus:outline-none focus:ring-2 focus:ring-(--rose) cursor-pointer"
              aria-label="Filter by status"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="relative min-w-36 flex-1 sm:flex-none">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-xl bg-(--paper) border border-(--line) text-xs font-semibold text-(--ink) focus:outline-none focus:ring-2 focus:ring-(--rose) cursor-pointer"
              aria-label="Filter by payment method"
            >
              <option value="All">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          {(searchQuery ||
            statusFilter !== "All" ||
            methodFilter !== "All") && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-(--line) bg-(--soft) text-(--muted) hover:text-(--ink) text-xs font-semibold transition-colors cursor-pointer shrink-0"
              title="Reset all filters"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Transactions List */}
      <div className="rounded-2xl bg-(--surface) border border-(--line) overflow-hidden">
        <div className="px-5 py-4 border-b border-(--line) flex items-center justify-between">
          <h2 className="text-base font-bold text-(--ink)">
            Transaction History
          </h2>
          <span className="text-xs text-(--muted)">
            {filteredTransactions.length} records found
          </span>
        </div>

        {isPaymentsLoading ? (
          <Skeletons />
        ) : paymentsError ? (
          <Error
            title="Payments"
            handleRefetch={loadPayments}
            error={paymentsError}
          />
        ) : filteredTransactions.length === 0 ? (
          <div className="py-16 text-center p-6 space-y-3">
            <div className="size-14 mx-auto rounded-2xl bg-(--soft) flex items-center justify-center text-(--muted)">
              <CreditCard size={26} />
            </div>
            <h3 className="text-lg font-bold text-(--ink)">
              {searchQuery || statusFilter !== "All" || methodFilter !== "All"
                ? "No Matching Transactions Found"
                : "No Transactions Yet"}
            </h3>
            <p className="text-xs sm:text-sm text-(--muted) max-w-sm mx-auto">
              {searchQuery || statusFilter !== "All" || methodFilter !== "All"
                ? "There are no payment records matching your current filter criteria."
                : "Customer payment transactions will appear here once orders are processed."}
            </p>
            {(searchQuery ||
              statusFilter !== "All" ||
              methodFilter !== "All") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--rose) text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-(--line) bg-(--soft)/40 text-(--muted) uppercase font-bold tracking-wider">
                    <th className="py-3.5 px-5">Txn ID</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Service</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--line)">
                  {paginatedTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-(--soft)/30 transition-colors"
                    >
                      <td className="py-4 px-5 font-mono font-bold text-(--rose)">
                        {tx.transactionCode}
                      </td>
                      <td className="py-4 px-4 text-(--muted)">
                        {tx.createdAt}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-(--ink)">
                          {tx.customerName}
                        </div>
                        <div className="text-[11px] text-(--muted)">
                          {tx.customerPhone}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-(--ink)">
                        {tx.serviceName}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-(--soft) text-(--ink) font-medium border border-(--line)">
                          {tx.method}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-(--ink)">
                        {formatCurrency(tx.total)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                            tx.status,
                          )}`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedTransaction(tx)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-(--line) bg-(--soft) hover:bg-(--line)/40 text-xs font-semibold text-(--ink) transition-colors cursor-pointer"
                        >
                          <Receipt size={13} />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-(--line)">
              {paginatedTransactions.map((tx) => (
                <div key={tx.id} className="p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-(--rose) bg-(--rose)/10 px-2 py-0.5 rounded-md">
                      {tx.transactionCode}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                        tx.status,
                      )}`}
                    >
                      {tx.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-(--ink)">
                      {tx.customerName}
                    </h3>
                    <p className="text-(--muted) mt-0.5">{tx.serviceName}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-(--paper) border border-(--line) flex items-center justify-between">
                    <span className="text-(--muted)">{tx.method}</span>
                    <span className="text-sm font-extrabold text-(--ink)">
                      {formatCurrency(tx.total)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-(--muted)">
                      {tx.createdAt}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedTransaction(tx)}
                      className="px-3 py-1 rounded-lg border border-(--line) bg-(--soft) text-xs font-semibold text-(--ink) cursor-pointer"
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>

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
                    {filteredTransactions.length}
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

      {/* 5. Payment Details Modal */}
      <PaymentDetailsModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};

export default Payments;
