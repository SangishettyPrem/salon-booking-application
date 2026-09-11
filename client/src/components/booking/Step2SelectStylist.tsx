import React from "react";
import { MoveLeft, Sparkles, Check } from "lucide-react";
import type { StaffMember } from "@/redux/features/staff/staff.types";

interface Step2SelectStylistProps {
  staff: StaffMember[];
  selectedStylist: StaffMember | "any";
  onSelectStylist: (stylist: StaffMember | "any") => void;
  onBack: () => void;
}

export const Step2SelectStylist: React.FC<Step2SelectStylistProps> = ({
  staff,
  selectedStylist,
  onSelectStylist,
  onBack,
}) => {
  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-(--surface) border border-(--line) shadow-xs space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1 border-b border-(--line) pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 rounded-lg hover:bg-(--soft) text-(--ink) transition-colors cursor-pointer"
          >
            <MoveLeft size={19} />
          </button>
          <h2 className="text-lg font-bold text-(--ink)">
            Step 2: Select a Specialist
          </h2>
        </div>

        <p className="text-xs text-(--muted) pl-7">
          Choose an available professional or let the salon allocate the best
          artist.
        </p>
      </div>

      {/* Any Stylist Option */}
      <div
        onClick={() => onSelectStylist("any")}
        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
          selectedStylist === "any"
            ? "bg-(--rose)/5 border-(--rose) ring-1 ring-(--rose)"
            : "bg-(--paper) border-(--line) hover:border-(--rose)/40"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-(--rose)/10 text-(--rose) flex items-center justify-center font-bold">
            <Sparkles size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-(--ink)">
              Any Available Specialist
            </h3>
            <p className="text-xs text-(--muted)">
              Recommended for maximum slot flexibility
            </p>
          </div>
        </div>
        <div
          className={`size-5 rounded-full flex items-center justify-center ${
            selectedStylist === "any"
              ? "bg-(--rose) text-white"
              : "border border-(--line)"
          }`}
        >
          {selectedStylist === "any" && <Check size={12} strokeWidth={3} />}
        </div>
      </div>

      {/* Specific Stylists */}
      {staff && staff.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {staff.map((stylist) => {
            const isSelected =
              selectedStylist !== "any" && selectedStylist._id === stylist._id;
            return (
              <div
                key={stylist._id}
                onClick={() => onSelectStylist(stylist)}
                className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-(--rose)/5 border-(--rose) ring-1 ring-(--rose)"
                    : "bg-(--paper) border-(--line) hover:border-(--rose)/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-(--soft) text-(--rose) font-bold flex items-center justify-center text-sm shrink-0">
                    {stylist.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-(--ink)">
                      {stylist.name}
                    </h4>
                    <p className="text-xs text-(--muted)">{stylist.role}</p>
                  </div>
                </div>

                <div
                  className={`size-5 rounded-full flex items-center justify-center ${
                    isSelected
                      ? "bg-(--rose) text-white"
                      : "border border-(--line)"
                  }`}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
