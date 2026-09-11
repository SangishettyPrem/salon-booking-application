import { useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Coins,
  ArrowRight,
  UserPlus,
  Scissors,
  CalendarDays,
  Sparkles,
  CheckCircle2,
  Clock3,
  BookOpen,
} from "lucide-react";
import WelcomeSection from "@/components/common/dashboard/WelcomeSection";
import SummaryCard from "@/components/common/dashboard/SummaryCard";
import QuickActions from "@/components/common/dashboard/QuickActions";
import type { QuickActionItem } from "@/shared/types/dashboard.types";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import SalonCreationForm from "@/components/salon/SalonCreationForm";
import { fetchDashboardStats } from "@/redux/features/owner/owner.slice";
import { formatCurrency } from "@/utils";

const defaultActions: QuickActionItem[] = [
  {
    label: "+ Add Staff",
    path: "/owner/staff",
    icon: <UserPlus size={16} />,
    variant: "primary",
  },
  {
    label: "+ Add Service",
    path: "/owner/services",
    icon: <Scissors size={16} />,
    variant: "secondary",
  },
  {
    label: "View Bookings",
    path: "/owner/bookings",
    icon: <CalendarDays size={16} />,
    variant: "secondary",
  },
];

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { salon } = useAppSelector((state) => state.salon);
  const { stats, isDashboardFetched } = useAppSelector((state) => state.owner);

  const loadDashboardStats = useCallback(() => {
    try {
      if (!salon) return;
      if (!isDashboardFetched) dispatch(fetchDashboardStats(salon._id));
    } catch (error) {}
  }, [salon, isDashboardFetched, dispatch]);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  // Profile completion calculation based on backend and secondary optional fields
  const profileSteps = useMemo(() => {
    if (!salon) return [];
    return [
      {
        id: "basic",
        label: "Basic Details & Address",
        completed: Boolean(
          salon.name && salon.phone && salon.addressLine1 && salon.city,
        ),
        actionHint: "Add salon name & address",
      },
      {
        id: "businessHours",
        label: "Weekly Business Hours",
        completed: Boolean(
          salon.businessHours &&
            Object.values(salon.businessHours).some((day) => day?.isOpen),
        ),
        actionHint: "Set weekly open days and operating hours",
      },
      {
        id: "amenities",
        label: "Salon Amenities",
        completed: Boolean(salon.amenities && salon.amenities.length > 0),
        actionHint: "Add features like AC, Wi-Fi, Parking",
      },
    ];
  }, [salon]);

  const completedStepsCount = profileSteps.filter((s) => s.completed).length;
  const completionPercentage =
    profileSteps.length > 0
      ? Math.round((completedStepsCount / profileSteps.length) * 100)
      : 0;
  const isProfileIncomplete = completionPercentage < 100;

  if (!salon) return <SalonCreationForm />;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6 sm:space-y-8">
      {/* 1. WELCOME SECTION */}
      <WelcomeSection />

      {/* 2. PROFILE COMPLETION BANNER (Shown when secondary details like timings/working days/amenities are missing) */}
      {isProfileIncomplete && (
        <div className="p-5 sm:p-6 rounded-2xl bg-(--surface) border border-amber-500/30 shadow-xs space-y-4 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <Sparkles size={12} />
                  <span>Profile {completionPercentage}% Complete</span>
                </span>
                <span className="text-xs text-(--muted)">
                  {completedStepsCount} of {profileSteps.length} steps completed
                </span>
              </div>
              <h3 className="text-base font-bold text-(--ink)">
                Complete Your Salon Profile
              </h3>
              <p className="text-xs text-(--muted) max-w-xl">
                Add your operating hours, working days, and amenities to help
                customers discover your salon and book appointments
                effortlessly.
              </p>
            </div>

            <Link
              to="/owner/profile"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-(--rose) text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity shrink-0 shadow-xs cursor-pointer"
            >
              <span>Complete Profile</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-(--line) h-2 rounded-full overflow-hidden relative z-10">
            <div
              className="bg-(--rose) h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Steps Checklist Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 relative z-10">
            {profileSteps.map((step) => (
              <div
                key={step.id}
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  step.completed
                    ? "bg-emerald-500/5 border-emerald-500/20 text-(--ink)"
                    : "bg-(--paper) border-(--line) text-(--muted)"
                }`}
              >
                <div
                  className={`size-5 rounded-full flex items-center justify-center shrink-0 text-xs ${
                    step.completed
                      ? "bg-emerald-500 text-white"
                      : "bg-(--line) text-(--muted)"
                  }`}
                >
                  {step.completed ? <CheckCircle2 size={12} /> : "•"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate text-[12px]">
                    {step.label}
                  </p>
                  <p className="text-[10px] text-(--muted) truncate">
                    {step.completed ? "Configured" : step.actionHint}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ALL-TIME SALON METRICS */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-(--muted)">
          Overall Performance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <SummaryCard
            icon={<Coins size={22} />}
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue || 0)}
          />
          <SummaryCard
            icon={<BookOpen size={22} />}
            label="Total Bookings"
            value={stats.totalBookings || 0}
          />
          <SummaryCard
            icon={<Clock3 size={22} />}
            label="Pending Bookings"
            value={stats.pendingBookings || 0}
          />
          <SummaryCard
            icon={<CheckCircle2 size={22} />}
            label="Completed Bookings"
            value={stats.completedBookings || 0}
          />
        </div>
      </div>

      <QuickActions actions={defaultActions} />
    </div>
  );
};

export default Dashboard;
