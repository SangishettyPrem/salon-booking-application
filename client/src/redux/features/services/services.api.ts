import api from "@/api/api";
import type { Service } from "./services.types";

export const getServicesBySalonIdAPI = async (salonId: string) => {
  return await api.get(`/salon/${salonId}/services`);
};

export const createServiceAPI = async (salonId: string, service: Service) => {
  return await api.post(`/salon/services/${salonId}`, service);
};

export const updateServiceAPI = async (serviceId: string, service: Service) => {
  return await api.put(`/salon/services/${serviceId}`, service);
};

export const deleteServiceAPI = async (serviceId: string) => {
  return await api.delete(`/salon/services/${serviceId}`);
};
