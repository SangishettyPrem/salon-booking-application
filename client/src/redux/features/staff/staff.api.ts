import api from "@/api/api";
import type { StaffActionRequest } from "./staff.types";

export const getStaffAPI = async (salonId: string) =>
  api.get(`/salon/${salonId}/staff`);

export const createStaffAPI = async (
  salonId: string,
  request: StaffActionRequest,
) => api.post(`/salon/staff/${salonId}`, request);

export const updateStaffAPI = async (
  staffId: string,
  data: StaffActionRequest,
) => api.put(`/salon/staff/${staffId}`, data);

export const deleteStaffAPI = async (id: string) =>
  api.delete(`/salon/staff/${id}`);
