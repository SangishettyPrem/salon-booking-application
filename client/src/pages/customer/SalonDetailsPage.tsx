import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  Check,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/utils";
import type { Service as SalonService } from "@/redux/features/services/services.types";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import { getSalonById } from "@/redux/features/salon/salon.slice";
import { getTodaySchedule, formatWeeklySchedule } from "@/utils/bookingUtils";

const SalonDetailsPage: React.FC = () => {
  const { salonId } = useParams<{ salonId: string }>();
  const navigate = useNavigate();
  const { publicSalons, isPublicSalonsLoading, publicSalonsError } =
    useAppSelector((state) => state.salon);
  const dispatch = useAppDispatch();
  const salon = salonId ? publicSalons?.[salonId] : null;

  const [selectedService, setSelectedService] = useState<SalonService | null>(
    null,
  );
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const todaySchedule = useMemo(
    () => getTodaySchedule(salon?.businessHours),
    [salon?.businessHours],
  );
  const weeklySchedule = useMemo(
    () => formatWeeklySchedule(salon?.businessHours),
    [salon?.businessHours],
  );

  useEffect(() => {
    if (salonId) {
      const cache = publicSalons[salonId];
      if (cache) return;
      dispatch(getSalonById(salonId));
    }
  }, [dispatch, salonId]);

  // Categories list
  const categories = useMemo(() => {
    if (!salon?.services) return ["All"];
    const cats = Array.from(new Set(salon.services.map((s) => s.category)));
    return ["All", ...cats];
  }, [salon]);

  // Filtered services
  const filteredServices = useMemo(() => {
    if (!salon?.services) return [];
    if (activeCategory === "All") return salon.services;
    return salon.services.filter((s) => s.category === activeCategory);
  }, [salon, activeCategory]);

  // Auto select default service
  useEffect(() => {
    if (salon?.services && salon.services.length > 0 && !selectedService) {
      setSelectedService(salon.services[0]);
    }
  }, [salon, selectedService]);

  const handleProceedToBooking = (serviceToBook?: SalonService) => {
    const service = serviceToBook || selectedService;
    const serviceParam = service ? `?serviceId=${service._id}` : "";
    navigate(`/salons/${salonId}/book${serviceParam}`, {
      state: {
        salon,
      },
    });
  };

  // Conditional early returns (safely after all hooks)
  if (!salonId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-xs text-(--muted)">
          Invalid Request. Missing Parameters
        </p>
      </div>
    );
  }

  if (isPublicSalonsLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="size-10 rounded-full border-3 border-(--rose) border-t-transparent animate-spin" />
        <p className="text-xs text-(--muted)">Loading salon details...</p>
      </div>
    );
  }

  if (salonId && publicSalonsError?.[salonId] && !salon) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-xs text-(--muted)">
          {publicSalonsError[salonId] ?? "Failed to Load Salon Details"}
        </p>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-xs text-(--muted)">Salon not found</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-20">
      {/* ========================================================================= */}
      {/* 1. HERO COVER & SALON INFO                                                */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-neutral-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-2xl border border-(--line)">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={
              salon.coverUrl ||
              "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
            }
            alt={salon.name}
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-6xl mx-auto space-y-6">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white backdrop-blur-xs transition-colors"
          >
            <ChevronLeft size={16} />
            <span>All Salons</span>
          </Link>

          {/* Salon Badges & Name */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              {salon.name}
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
              {salon.description}
            </p>
          </div>

          {/* Key Facts / Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs text-neutral-300 border-t border-white/15">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-(--rose) shrink-0" />
              <span className="truncate">
                {salon.addressLine1}, {salon.city}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock
                size={16}
                className={
                  todaySchedule.isOpen
                    ? "text-(--rose)"
                    : "text-amber-400 shrink-0"
                }
              />
              <span className="truncate">
                {todaySchedule.isOpen
                  ? `Open Today: ${todaySchedule.text}`
                  : "Closed Today"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-(--rose) shrink-0" />
              <span>+91 {salon.phone}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. AMENITIES BAR                                                          */}
      {/* ========================================================================= */}
      {salon.amenities && salon.amenities.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-4 sm:p-5 rounded-2xl bg-(--surface) border border-(--line) flex items-center gap-3 overflow-x-auto scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-(--muted) shrink-0 flex items-center gap-1.5">
              <Sparkles size={14} className="text-(--rose)" />
              <span>Amenities:</span>
            </span>
            <div className="flex items-center gap-2">
              {salon.amenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl text-xs font-medium bg-(--soft) text-(--ink) border border-(--line) whitespace-nowrap"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT: SERVICES MENU + STICKY SIDEBAR                           */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Services & Stylists & Reviews (8 Cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* A. Services Menu */}
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-(--line) pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-(--rose)">
                    Select Your Treatment
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-(--ink)">
                    Services & Pricing
                  </h2>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      activeCategory === cat
                        ? "bg-(--rose) text-white shadow-xs"
                        : "bg-(--soft) text-(--muted) hover:text-(--ink) border border-(--line)"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Services List */}
              <div className="space-y-3">
                {filteredServices.map((service) => {
                  const isChosen = selectedService?._id === service._id;
                  return (
                    <div
                      key={service._id}
                      onClick={() => setSelectedService(service)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-4 cursor-pointer ${
                        isChosen
                          ? "bg-(--rose)/5 border-(--rose) shadow-sm ring-1 ring-(--rose)"
                          : "bg-(--surface) border-(--line) hover:border-(--rose)/40 hover:bg-(--soft)/40"
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                              isChosen
                                ? "bg-(--rose) text-white"
                                : "border border-(--line) bg-(--paper)"
                            }`}
                          >
                            {isChosen && <Check size={12} strokeWidth={3} />}
                          </span>
                          <h3 className="font-bold text-sm sm:text-base text-(--ink)">
                            {service.name}
                          </h3>
                        </div>

                        <p className="text-xs text-(--muted) leading-relaxed pl-7">
                          {service.description}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-(--muted) pl-7 pt-1 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-(--rose)" />
                            <span>{service.durationMinutes} mins</span>
                          </span>
                          <span>•</span>
                          <span className="text-(--rose) font-semibold">
                            {service.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base sm:text-lg font-extrabold text-(--ink) block">
                          {formatCurrency(service.price)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedService(service);
                            handleProceedToBooking(service);
                          }}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-(--rose) hover:underline cursor-pointer"
                        >
                          <span>Book</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* B. Stylists / Team */}
            {salon.staff && salon.staff.length > 0 && (
              <div className="space-y-5 border-t border-(--line) pt-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-(--rose)">
                    Certified Specialists
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-(--ink)">
                    Meet Our Stylists
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {salon.staff.map((stylist) => (
                    <div
                      key={stylist._id}
                      className="p-4 rounded-2xl bg-(--surface) border border-(--line) flex items-center gap-3.5 shadow-2xs"
                    >
                      <div className="size-12 rounded-2xl bg-(--rose)/10 text-(--rose) font-bold flex items-center justify-center text-base shrink-0">
                        {stylist.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-(--ink) truncate">
                          {stylist.name}
                        </h4>
                        <p className="text-xs text-(--muted) font-medium truncate">
                          {stylist.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Sticky Booking Summary (4 Cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="p-6 rounded-3xl bg-(--surface) border border-(--line) shadow-xl space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-(--rose)">
                  Instant Reservation
                </span>
                <h3 className="text-lg font-extrabold text-(--ink)">
                  Appointment Summary
                </h3>
              </div>

              {selectedService ? (
                <div className="p-4 rounded-2xl bg-(--paper) border border-(--line) space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-(--ink)">
                      {selectedService.name}
                    </span>
                    <span className="font-extrabold text-(--rose)">
                      {formatCurrency(selectedService.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-(--muted)">
                    <Clock size={13} />
                    <span>
                      {selectedService.durationMinutes} minutes session
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-(--muted) italic">
                  Select a service from the left to proceed.
                </p>
              )}

              <div className="space-y-2.5 text-xs text-(--muted) border-t border-(--line) pt-4">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Instant appointment confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Choose preferred stylist in next step</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500" />
                  <span>Secure online payment with Razorpay</span>
                </div>
              </div>

              <button
                type="button"
                disabled={!selectedService}
                onClick={() => handleProceedToBooking()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-(--rose) text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 cursor-pointer"
              >
                <span>Select Time & Stylist</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Weekly Business Hours Card */}
            <div className="p-6 rounded-3xl bg-(--surface) border border-(--line) shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-(--ink) flex items-center gap-2">
                  <Clock size={16} className="text-(--rose)" />
                  <span>Business Hours</span>
                </h4>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    todaySchedule.isOpen
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                  }`}
                >
                  {todaySchedule.isOpen ? "Open Now" : "Closed"}
                </span>
              </div>

              <div className="space-y-2 pt-1 divide-y divide-(--line)/50">
                {weeklySchedule.map((day) => (
                  <div
                    key={day.key}
                    className={`flex items-center justify-between pt-2 text-xs ${
                      day.isToday ? "font-bold text-(--rose)" : "text-(--muted)"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{day.label}</span>
                      {day.isToday && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-(--rose)/10 text-(--rose) font-bold">
                          Today
                        </span>
                      )}
                    </span>
                    <span
                      className={
                        day.isOpen
                          ? "text-(--ink) font-medium"
                          : "text-gray-400 font-medium italic"
                      }
                    >
                      {day.timeText}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SalonDetailsPage;
