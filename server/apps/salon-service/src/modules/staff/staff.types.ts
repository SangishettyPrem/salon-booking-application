export interface CreateStaffRequest {
  name: string;
  email: string;
  phone: string;
  role: string;
  assignedServices: string[];
}
