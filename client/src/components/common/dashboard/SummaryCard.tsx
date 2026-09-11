import React from "react";

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}

const SummaryCard = ({ icon, label, value }: SummaryCardProps) => {
  return (
    <div className="p-5 rounded-2xl bg-(--surface) border border-(--line) flex items-center gap-4 transition-all hover:shadow-sm">
      <div
        className={`size-11 rounded-xl flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-(--muted) uppercase tracking-wider">
          {label}
        </p>
        <h3 className="text-2xl font-bold text-(--ink) mt-0.5">{value}</h3>
      </div>
    </div>
  );
};

export default SummaryCard;
