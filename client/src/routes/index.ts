import { lazy } from "react";

// Auth Pages
export const AuthPage = lazy(() => import("@/pages/auth/AuthPage"));
export const ForgotPassword = lazy(
  () => import("@/pages/auth/ForgotPasswordPage"),
);
export const ResetPasswordPage = lazy(
  () => import("@/pages/auth/ResetPasswordPage"),
);

export const HomePage = lazy(() => import("@/pages/HomePage"));
export const ProfilePage = lazy(() => import("@/pages/auth/Profile"));
export const SalonDetailsPage = lazy(
  () => import("@/pages/customer/SalonDetailsPage"),
);
export const BookingWizard = lazy(
  () => import("@/pages/customer/BookingWizard"),
);
export const Checkout = lazy(() => import("@/pages/customer/Checkout"));
export const BookingSuccess = lazy(
  () => import("@/pages/customer/BookingSuccess"),
);
export const BookingFailure = lazy(
  () => import("@/pages/customer/BookingFailure"),
);
export const CustomerBookings = lazy(
  () => import("@/pages/customer/CustomerBookings"),
);
export const Dashboard = lazy(() => import("@/pages/owner/Dashboard"));
export const Booking = lazy(() => import("@/pages/owner/BookingPage"));
export const SalonProfile = lazy(() => import("@/pages/owner/SalonProfile"));
export const Services = lazy(() => import("@/pages/owner/Services"));
export const Staff = lazy(() => import("@/pages/owner/Staff"));
export const Payments = lazy(() => import("@/pages/owner/Payments"));

export const NotFound = lazy(() => import("@/pages/common/NotFound"));
export const Unauthorized = lazy(
  () => import("@/components/common/Unauthorized"),
);
export const ServerDown = lazy(() => import("@/pages/common/ServerDown"));
export const SessionExpired = lazy(
  () => import("@/pages/common/SessionExpired"),
);
