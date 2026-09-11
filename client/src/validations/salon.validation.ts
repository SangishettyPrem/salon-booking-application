import type { SalonCreationState } from "@/redux/features/salon/salon.types";
import * as Yup from "yup";

export const SalonCreationValidationSchema = Yup.object<SalonCreationState>({
  name: Yup.string()
    .trim()
    .required("Salon name is required")
    .min(2, "Use at least 2 characters")
    .max(80, "Use 80 characters or fewer"),
  phone: Yup.string()
    .trim()
    .required("Phone number is required")
    .matches(/^\d{10}$/, "Phone number must be 10 digits"),
  email: Yup.string()
    .trim()
    .required("Email is required")
    .email("Enter a valid email")
    .max(120, "Use 120 characters or fewer"),
  description: Yup.string().max(500, "Use 500 characters or fewer"),
  addressLine1: Yup.string().trim().required("Address line 1 is required"),
  addressLine2: Yup.string(),
  city: Yup.string().trim().required("City is required"),
  state: Yup.string().trim().required("State is required"),
  country: Yup.string().trim().required("Country is required").default("India"),
  postalCode: Yup.string()
    .trim()
    .required("Postal code is required")
    .matches(/^[A-Za-z0-9\s-]{3,12}$/, "Enter a valid postal code"),
});
