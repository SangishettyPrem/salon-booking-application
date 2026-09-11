import { z } from "zod";

export const createStaffSchema = z.object({
  name: z
    .string({ error: "Staff name is required" })
    .trim()
    .min(2, "Staff name must be at least 2 characters")
    .max(80, "Staff name cannot exceed 80 characters"),
  email: z
    .string({ error: "Email is required" })
    .trim()
    .email("Invalid email address"),
  phone: z
    .string({ error: "Phone number is required" })
    .trim()
    .regex(/^\d{10}$/, "Phone number must be a 10-digit number"),
  role: z
    .enum([
      "Senior Stylist",
      "Hair Specialist",
      "Color Master",
      "Skin & Spa Therapist",
      "Barber & Groomer",
      "Makeup Artist",
    ])
    .default("Senior Stylist"),
  assignedServices: z.array(z.string().trim()).optional().default([]),
  salonId: z.string().optional(),
});

export const updateStaffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Staff name must be at least 2 characters")
    .max(80, "Staff name cannot exceed 80 characters")
    .optional(),
  email: z.string().trim().email("Invalid email address").optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be a 10-digit number")
    .optional(),
  role: z
    .enum([
      "Senior Stylist",
      "Hair Specialist",
      "Color Master",
      "Skin & Spa Therapist",
      "Barber & Groomer",
      "Makeup Artist",
    ])
    .optional(),
  experienceYears: z.coerce.number().min(0).optional(),
  status: z.enum(["Active", "On Leave", "Part Time"]).optional(),
  assignedServices: z.array(z.string().trim()).optional(),
});
