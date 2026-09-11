import { z } from "zod";

export const createServiceSchema = z.object({
  name: z
    .string({ error: "Service name is required" })
    .trim()
    .min(2, "Service name must be at least 2 characters")
    .max(100, "Service name cannot exceed 100 characters"),
  category: z
    .enum([
      "Haircut & Styling",
      "Beard & Grooming",
      "Skin & Facials",
      "Spa & Massage",
      "Bridal & Makeover",
      "Hair Color & Highlights",
    ])
    .default("Haircut & Styling"),
  price: z.coerce
    .number({ error: "Price is required" })
    .min(0, "Price must be non-negative"),
  durationMinutes: z.coerce
    .number({ error: "Duration is required" })
    .min(5, "Duration must be at least 5 minutes")
    .default(45),
  description: z.string().trim().optional().default(""),
  salonId: z.string().optional(),
});

export const updateServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Service name must be at least 2 characters")
    .max(100, "Service name cannot exceed 100 characters")
    .optional(),
  category: z
    .enum([
      "Haircut & Styling",
      "Beard & Grooming",
      "Skin & Facials",
      "Spa & Massage",
      "Bridal & Makeover",
      "Hair Color & Highlights",
    ])
    .optional(),
  price: z.coerce.number().min(0, "Price must be non-negative").optional(),
  durationMinutes: z.coerce
    .number()
    .min(5, "Duration must be at least 5 minutes")
    .optional(),
  description: z.string().trim().optional(),
});
