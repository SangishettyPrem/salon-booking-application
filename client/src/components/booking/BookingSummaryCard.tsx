import React from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/utils";
import type { Service as SalonService } from "@/redux/features/services/services.types";
import type { StaffMember } from "@/redux/features/staff/staff.types";
import type { Salon } from "@/redux/features/salon/salon.types";

interface BookingSummaryCardProps {
  salon: Salon;
  selectedServices: SalonService[];
  selectedStylist: StaffMember | "any";
  selectedDate: string;
  selectedSlot: string;
  totalDuration: number;
  subtotal: number;
  tax: number;
  total: number;
  currentStep: number;
  onNext: () => void;
}

export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({
  salon,
  selectedServices,
  selectedStylist,
  selectedDate,
  selectedSlot,
  totalDuration,
  subtotal,
  tax,
  total,
  currentStep,
  onNext,
}) => {
  return (
    <div className="lg:col-span-4 sticky top-24 space-y-4">
      <div className="p-6 rounded-3xl bg-(--surface) border border-(--line) shadow-xl space-y-5">
        {/* Salon Header */}
        <div className="space-y-1 border-b border-(--line) pb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-(--rose)">
            Reservation At
          </span>
          <h3 className="font-extrabold text-base text-(--ink)">
            {salon.name}
          </h3>
          <p className="text-xs text-(--muted) flex items-center gap-1">
            <MapPin size={13} className="shrink-0 text-(--rose)" />
            <span className="truncate">
              {salon.addressLine1}, {salon.city}
            </span>
          </p>
        </div>

        {/* Chosen Details */}
        <div className="space-y-3 text-xs">
          {/* Selected Services */}
          <div>
            <span className="font-bold text-(--muted) block mb-1">
              Selected Treatments ({selectedServices.length}):
            </span>
            <div className="space-y-1">
              {selectedServices.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between text-(--ink) font-medium"
                >
                  <span className="truncate max-w-44">{s.name}</span>
                  <span>{formatCurrency(s.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stylist */}
          <div className="pt-2 border-t border-(--line) flex items-center justify-between">
            <span className="text-(--muted)">Specialist:</span>
            <span className="font-bold text-(--ink)">
              {selectedStylist === "any"
                ? "Any Available"
                : selectedStylist.name}
            </span>
          </div>

          {/* Date & Time */}
          {selectedDate && selectedSlot && (
            <div className="pt-2 border-t border-(--line) flex items-center justify-between">
              <span className="text-(--muted)">Schedule:</span>
              <span className="font-bold text-(--rose)">
                {selectedDate} at {selectedSlot}
              </span>
            </div>
          )}

          {/* Duration */}
          <div className="pt-2 border-t border-(--line) flex items-center justify-between">
            <span className="text-(--muted)">Estimated Time:</span>
            <span className="font-bold text-(--ink)">{totalDuration} mins</span>
          </div>
        </div>

        {/* Price Total */}
        <div className="pt-4 border-t border-(--line) space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-(--muted)">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-(--muted)">
            <span>Taxes & GST (5%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex items-center justify-between text-base font-extrabold text-(--ink) pt-2 border-t border-(--line)">
            <span>Total Payable</span>
            <span className="text-(--rose)">{formatCurrency(total)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-(--rose) text-white text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity shadow-md cursor-pointer"
        >
          <span>{currentStep === 3 ? "Proceed to Checkout" : "Continue"}</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};
