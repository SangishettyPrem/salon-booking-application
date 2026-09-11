import * as z from "zod";

export const registerSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must be less than 50 characters" }),
  email: z
    .string({ error: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string({ error: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters long" }),
  phone: z
    .string({ error: "Phone number is required" })
    .min(10, { message: "Phone number must be at least 10 digits long" })
    .regex(/^[0-9]\d{9}$/, "Invalid phone number"),
  role: z
    .enum(["customer", "owner", "staff", "admin"], {
      error: "Role is required",
    })
    .default("customer")
    .optional(),
  avatarUrl: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string({ error: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .transform((value) => value.toLowerCase()),
});

export const resetPasswordSchema = z
  .object({
    email: z
      .string({ error: "Email is required" })
      .trim()
      .email("Invalid email address")
      .transform((value) => value.toLowerCase()),
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(100),

    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  _id: z.string().optional(),
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must be less than 50 characters" })
    .optional(),
  phone: z
    .string()
    .regex(/^[0-9]\d{9}$/, "Invalid phone number")
    .optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  avatarUrl: z.string().optional(),
});
