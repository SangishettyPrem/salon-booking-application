import type { DefaultResponse } from "@/shared/types";
import type { Service } from "../services/services.types";
import type { StaffMember } from "../staff/staff.types";

export interface SalonCreationState {
  name: string;
  phone: string;
  email: string;
  description: string;

  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface DaySchedule {
  isOpen: boolean;
  openingTime: string | null;
  closingTime: string | null;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const DAYS_OF_WEEK: { key: DayOfWeek; label: string; short: string }[] =
  [
    { key: "monday", label: "Monday", short: "Mon" },
    { key: "tuesday", label: "Tuesday", short: "Tue" },
    { key: "wednesday", label: "Wednesday", short: "Wed" },
    { key: "thursday", label: "Thursday", short: "Thu" },
    { key: "friday", label: "Friday", short: "Fri" },
    { key: "saturday", label: "Saturday", short: "Sat" },
    { key: "sunday", label: "Sunday", short: "Sun" },
  ];

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PublicSalon {
  salon: Salon;
  services: Service[];
  staff: StaffMember[];
}

export interface SalonSliceState {
  salon: Salon | null;
  isSalonFetched: boolean;
  isInitilazing: boolean;
  error: string | null;

  publicSalons: Record<string, Salon>;
  publicSalonsError: Record<string, string | null>;
  isPublicSalonsLoading: boolean;

  salons: Record<string, Salon[]>;
  isSalonsLoading: boolean;
  isSalonsFetched: boolean;
  pagination: PaginationInfo | null;
}

export interface getAllSalonParams {
  page?: number;
  limit?: number;
}

export interface Salon extends SalonCreationState {
  _id: string;
  ownerId: string;

  businessHours: BusinessHours;

  amenities: string[];
  coverUrl?: string;

  services: Service[] | [];
  staff: StaffMember[] | [];
}

export interface UpdateSalonRequest extends Partial<Salon> {
  businessHours?: BusinessHours;
  amenities: string[];
}

export interface getSalonByOwnerResponse extends DefaultResponse {
  salon: Salon;
}

export interface getAllSalonResponse extends DefaultResponse {
  salons: Salon[];
  pagination?: PaginationInfo;
}

export interface getPublicSalonByIdResponse extends DefaultResponse {
  data: {
    salon: Salon;
    services: Service[];
    staff: StaffMember[];
  };
}
