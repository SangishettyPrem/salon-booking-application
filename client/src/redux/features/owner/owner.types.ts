import type { DefaultResponse } from "@/shared/types";
import type { Booking } from "@/redux/features/bookings/bookings.types";

export interface DashboardStats {
  todayBookings: number;
  todayRevenue: number;
  upcomingBookings: number;
  activeStaff: number;
  totalRevenue?: number;
  totalBookings?: number;
  pendingBookings?: number;
  completedBookings?: number;
}

export interface OwnerState {
  isLoading: boolean;
  isDashboardFetched: boolean;
  stats: DashboardStats;
  recentBookings: Booking[];
  error: string | null;
}

export interface GetDashboardResponse extends DefaultResponse {
  stats: DashboardStats;
}
