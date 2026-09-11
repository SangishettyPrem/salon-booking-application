import React from "react";
import { X, CheckCircle2, Clock, RotateCcw, Receipt } from "lucide-react";
import { formatCurrency } from "@/utils";
import type { PaymentTransaction } from "@/redux/features/payment/payment.types";

export interface PaymentDetailsModalProps {
  transaction: PaymentTransaction | null;
  onClose: () => void;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const getStatusBadge = (status: PaymentTransaction["status"]) => {
    switch (status) {
      case "Paid":
        return {
          badge:
            "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
          icon: <CheckCircle2 size={14} />,
        };
      case "Pending":
        return {
          badge:
            "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
          icon: <Clock size={14} />,
        };
      default:
        return {
          badge:
            "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
          icon: <RotateCcw size={14} />,
        };
    }
  };

  const { badge, icon } = getStatusBadge(transaction.status);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-(--surface) text-(--ink) border border-(--line) rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--line) pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-(--rose)/10 text-(--rose) flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-(--ink)">
                Payment Invoice
              </h2>
              <p className="text-xs text-(--muted) font-mono">
                {transaction.transactionCode}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--soft) flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount Hero */}
        <div className="text-center p-4 rounded-2xl bg-(--paper) border border-(--line) space-y-1">
          <span className="text-xs font-semibold text-(--muted) uppercase tracking-wider">
            Total Paid Amount
          </span>
          <h3 className="text-3xl font-extrabold text-(--ink)">
            {formatCurrency(transaction.total)}
          </h3>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge}`}
            >
              {icon}
              <span>{transaction.status}</span>
            </span>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-(--line)">
            <span className="text-(--muted)">Customer Name</span>
            <span className="font-semibold text-(--ink)">
              {transaction.customerName}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-(--line)">
            <span className="text-(--muted)">Phone Number</span>
            <span className="font-semibold text-(--ink)">
              +91 {transaction.customerPhone}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-(--line)">
            <span className="text-(--muted)">Service Provided</span>
            <span className="font-semibold text-(--ink)">
              {transaction.serviceName}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-(--line)">
            <span className="text-(--muted)">Booking Ref</span>
            <span className="font-mono font-bold text-(--rose)">
              #{transaction.bookingCode}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-(--line)">
            <span className="text-(--muted)">Payment Method</span>
            <span className="font-semibold text-(--ink)">
              {transaction.method}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-(--line)">
            <span className="text-(--muted)">Base Service Amount</span>
            <span className="font-medium text-(--ink)">
              {formatCurrency(transaction.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-(--line)">
            <span className="text-(--muted)">Taxes & Service GST (5%)</span>
            <span className="font-medium text-(--ink)">
              {formatCurrency(transaction.tax)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 pt-2 text-sm font-bold text-(--ink)">
            <span>Net Total</span>
            <span className="text-(--rose)">
              {formatCurrency(transaction.total)}
            </span>
          </div>
        </div>

        {/* Timestamps */}
        <div className="text-[11px] text-(--muted) space-y-1 bg-(--soft) p-3 rounded-xl border border-(--line)">
          <div className="flex items-center justify-between">
            <span>Created At:</span>
            <span className="font-medium text-(--ink)">
              {transaction.createdAt}
            </span>
          </div>
          {transaction.paidAt && (
            <div className="flex items-center justify-between">
              <span>Settled At:</span>
              <span className="font-medium text-(--ink)">
                {transaction.paidAt}
              </span>
            </div>
          )}
        </div>

        {/* Close */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl border border-(--line) bg-(--soft) hover:bg-(--line)/40 text-xs font-semibold text-(--ink) transition-colors cursor-pointer"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;
