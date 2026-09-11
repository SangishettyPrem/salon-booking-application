import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface BookingStepIndicatorProps {
  salonId: string;
  salonName: string;
  currentStep: number;
}

const STEPS = [
  { step: 1, label: "Services" },
  { step: 2, label: "Specialist" },
  { step: 3, label: "Time Slot" },
];

export const BookingStepIndicator: React.FC<BookingStepIndicatorProps> = ({
  salonId,
  salonName,
  currentStep,
}) => {
  return (
    <div className="space-y-4">
      <Link
        to={`/salons/${salonId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--muted) hover:text-(--ink) transition-colors"
      >
        <ChevronLeft size={16} />
        <span>Back to {salonName}</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-(--line) pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-(--rose)">
            Booking Wizard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-(--ink) tracking-tight">
            Reserve Your Appointment
          </h1>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map(({ step, label }) => (
            <div
              key={step}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentStep === step
                  ? "bg-(--rose) text-white shadow-xs"
                  : currentStep > step
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-(--soft) text-(--muted)"
              }`}
            >
              <span>{step}</span>
              <span className="hidden md:inline">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
