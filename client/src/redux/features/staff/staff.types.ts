import type { DefaultResponse } from "@/shared/types";

export type StaffRole =
  | "Senior Stylist"
  | "Hair Specialist"
  | "Color Master"
  | "Skin & Spa Therapist"
  | "Barber & Groomer"
  | "Makeup Artist";

export interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  assignedServices: string[];
  avatarUrl?: string;
}

export interface StaffState {
  isLoading: boolean;
  isStaffFetched: boolean;
  staffList: StaffMember[];
  error: string | null;
}

export interface GetStaffResponse extends DefaultResponse {
  staff: StaffMember[];
}

export interface StaffActionRequest {
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  assignedServices: string[];
}

export interface StaffActionResponse extends DefaultResponse {
  staff: StaffMember;
}
