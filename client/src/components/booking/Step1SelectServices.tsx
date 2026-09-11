import React from "react";
import { Clock, Check } from "lucide-react";
import { formatCurrency } from "@/utils";
import type { Service as SalonService } from "@/redux/features/services/services.types";

interface Step1SelectServicesProps {
  services: SalonService[];
  selectedServices: SalonService[];
  onToggleService: (service: SalonService) => void;
}

export const Step1SelectServices: React.FC<Step1SelectServicesProps> = ({
  services,
  selectedServices,
  onToggleService,
}) => {
  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-(--surface) border border-(--line) shadow-xs space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1 border-b border-(--line) pb-4">
        <h2 className="text-lg font-bold text-(--ink)">
          Step 1: Choose Your Services
        </h2>
        <p className="text-xs text-(--muted)">
          Select one or multiple services you'd like to book in this visit.
        </p>
      </div>

      <div className="space-y-3">
        {services && services.length > 0 ? (
          services.map((service) => {
            const isSelected = selectedServices.some(
              (s) => s._id === service._id,
            );
            return (
              <div
                key={service._id}
                onClick={() => onToggleService(service)}
                className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer ${
                  isSelected
                    ? "bg-(--rose)/5 border-(--rose) ring-1 ring-(--rose)"
                    : "bg-(--paper) border-(--line) hover:border-(--rose)/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-5 rounded-md flex items-center justify-center text-xs shrink-0 ${
                      isSelected
                        ? "bg-(--rose) text-white"
                        : "border border-(--line) bg-(--surface)"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-(--ink)">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-(--muted) font-medium">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-(--rose)" />
                        <span>{service.durationMinutes} mins</span>
                      </span>
                      <span>•</span>
                      <span>{service.category}</span>
                    </div>
                  </div>
                </div>

                <span className="text-base font-extrabold text-(--ink)">
                  {formatCurrency(service.price)}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-(--muted) py-4">
            No services listed for this salon yet.
          </p>
        )}
      </div>
    </div>
  );
};
