import type { DefaultResponse } from "@/shared/types";

export type ServiceCategory =
  | "Haircut & Styling"
  | "Beard & Grooming"
  | "Skin & Facials"
  | "Spa & Massage"
  | "Bridal & Makeover"
  | "Hair Color & Highlights";

export interface Service {
  _id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  durationMinutes: number;
  description: string;
}

export interface ServicesInitialState {
  services: Service[];
  isLoading: boolean;
  isServicesFetched: boolean;
  error: string | null;
}

export interface fetchServicesBySalonResponse extends DefaultResponse {
  services: Service[];
}

export interface ServiceActionResponse extends DefaultResponse {
  service: Service;
}

export interface updateServiceResponse extends DefaultResponse {
  service: Service;
}

export interface deleteServiceResponse extends DefaultResponse {}
