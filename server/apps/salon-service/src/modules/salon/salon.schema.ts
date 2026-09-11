import * as z from "zod";

export const createSalonSchema = z.object({
  name: z
    .string({ error: "Salon Name is required" })
    .trim()
    .min(2, "Salon Name must be at least 2 characters long")
    .max(80, "Salon Name cannot exceed 80 characters"),
  email: z
    .string({ error: "Email is required" })
    .trim()
    .email("Invalid email address"),
  phone: z
    .string({ error: "Phone Number is required" })
    .trim()
    .regex(/^\d{10}$/, "Phone number must be a 10-digit number"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  addressLine1: z
    .string({ error: "Address Line 1 is required" })
    .trim()
    .min(1, "Address Line 1 is required"),
  addressLine2: z.string().trim().optional(),
  city: z
    .string({ error: "City is required" })
    .trim()
    .min(1, "City is required"),
  state: z
    .string({ error: "State is required" })
    .trim()
    .min(1, "State is required"),
  country: z.string().trim().optional().default("India"),
  postalCode: z
    .string({ error: "Postal Code is required" })
    .trim()
    .regex(/^[A-Za-z0-9\s-]{3,12}$/, "Invalid postal code format"),
  category: z
    .string()
    .trim()
    .max(80, "Category cannot exceed 80 characters")
    .optional(),
  amenities: z.array(z.string().trim()).optional(),
  coverUrl: z.string().trim().optional(),
});

export const updateSalonSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Salon Name must be at least 2 characters long")
    .max(80, "Salon Name cannot exceed 80 characters")
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Must be a 10-digit number")
    .optional(),
  email: z.string().trim().email("Invalid email address").optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  addressLine1: z
    .string()
    .trim()
    .min(1, "Address Line 1 is required")
    .optional(),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required").optional(),
  state: z.string().trim().min(1, "State is required").optional(),
  country: z.string().trim().optional(),
  postalCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9\s-]{3,12}$/, "Invalid postal code format")
    .optional(),
  category: z
    .string()
    .trim()
    .max(80, "Category cannot exceed 80 characters")
    .optional(),
  businessHours: z
    .object({
      sunday: z.object({
        isOpen: z.boolean().default(false),
        openingTime: z.string().optional().nullable(),
        closingTime: z.string().optional().nullable(),
      }),
      monday: z.object({
        isOpen: z.boolean().default(false),
        openingTime: z.string().optional().nullable(),
        closingTime: z.string().optional().nullable(),
      }),
      tuesday: z.object({
        isOpen: z.boolean().default(false),
        openingTime: z.string().optional().nullable(),
        closingTime: z.string().optional().nullable(),
      }),
      wednesday: z.object({
        isOpen: z.boolean().default(false),
        openingTime: z.string().optional().nullable(),
        closingTime: z.string().optional().nullable(),
      }),
      thursday: z.object({
        isOpen: z.boolean().default(false),
        openingTime: z.string().optional().nullable(),
        closingTime: z.string().optional().nullable(),
      }),
      friday: z.object({
        isOpen: z.boolean().default(false),
        openingTime: z.string().optional().nullable(),
        closingTime: z.string().optional().nullable(),
      }),
      saturday: z.object({
        isOpen: z.boolean().default(false),
        openingTime: z.string().optional().nullable(),
        closingTime: z.string().optional().nullable(),
      }),
    })
    .optional(),
  amenities: z.array(z.string().trim()).optional(),
  coverUrl: z.string().trim().optional(),
});
