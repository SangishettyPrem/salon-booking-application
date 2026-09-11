import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/utils";
import type { Salon } from "@/redux/features/salon/salon.types";
import { getTodaySchedule } from "@/utils/bookingUtils";

export interface SalonCardProps {
  salon: Salon;
}

const SalonCard: React.FC<SalonCardProps> = ({ salon }) => {
  const coverImage =
    salon.coverUrl ||
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80";

  const startingPrice =
    salon.services && salon.services.length > 0
      ? Math.min(...salon.services.map((s) => s.price || 0))
      : 300;

  const todaySchedule = getTodaySchedule(salon.businessHours);

  return (
    <div className="group rounded-3xl bg-(--surface) border border-(--line) overflow-hidden shadow-2xs hover:shadow-xl hover:border-(--rose)/50 transition-all duration-300 flex flex-col justify-between">
      {/* 1. Image Banner */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-(--soft)">
        <img
          src={coverImage}
          alt={salon.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        {/* Starting Price Banner (Bottom Right of Image) */}
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-(--rose) text-white shadow-md">
            Starts at {formatCurrency(startingPrice)}
          </span>
        </div>
      </div>

      {/* 2. Body Details */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Salon Name & Verified */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-base text-(--ink) group-hover:text-(--rose) transition-colors line-clamp-1">
              {salon.name}
            </h3>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-(--muted)">
            <MapPin size={14} className="text-(--rose) shrink-0" />
            <span className="truncate">
              {salon.addressLine1 || "Main Road"}, {salon.city || "Bengaluru"}
            </span>
          </div>

          {/* Services Pills */}
          {salon.services && salon.services.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {salon.services.slice(0, 3).map((srv, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-(--soft) text-(--ink) border border-(--line) truncate max-w-32"
                >
                  {srv.name}
                </span>
              ))}
              {salon.services.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold text-(--rose) bg-(--rose)/10">
                  +{salon.services.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* 3. Footer Action */}
        <div className="pt-3 border-t border-(--line) flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-(--muted)">
            <Clock
              size={13}
              className={
                todaySchedule.isOpen ? "text-(--rose)" : "text-gray-400"
              }
            />
            <span
              className={
                todaySchedule.isOpen
                  ? "text-(--ink)"
                  : "text-gray-400 font-medium"
              }
            >
              {todaySchedule.text}
            </span>
          </div>

          <Link
            to={`/salons/${salon._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-(--soft) hover:bg-(--rose) text-(--ink) hover:text-white text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs"
          >
            <span>View Salon</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SalonCard;
