import api from "@/api/api";

export const getOwnerDashboardStatsAPI = async (salonId?: string) =>
  api.get("/bookings/owner/dashboard", { params: { salonId } });
