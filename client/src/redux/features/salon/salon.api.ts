import api from "@/api/api";
import type {
  getAllSalonParams,
  SalonCreationState,
  UpdateSalonRequest,
} from "./salon.types";

// ==================== SALON APIS ====================
export const getSalonByOwnerAPI = async () => api.get("/salon/me");

export const getAllSalonsAPI = async (params: getAllSalonParams) =>
  api.get("/salon/all", { params });

export const getSalonByIdAPI = async (id: string) => api.get(`/salon/${id}`);

export const createSalonOwnerAPI = async (data: SalonCreationState) =>
  api.post("/salon", data);

export const updateSalonOwnerAPI = async (
  request: UpdateSalonRequest,
  salonId: string,
) => api.put(`/salon/${salonId}`, request);

export const deleteSalonOwnerAPI = async (salonId: string) =>
  api.delete(`/salon/${salonId}`);

export const getPublicSalonByIdAPI = async (id: string) =>
  api.get(`/salon/${id}`);
