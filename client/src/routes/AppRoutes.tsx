import Loader from "@/components/common/Loader.tsx";
import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import { Suspense } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import {
  AuthPage,
  HomePage,
  ProfilePage,
  SalonDetailsPage,
  BookingWizard,
  Checkout,
  BookingSuccess,
  CustomerBookings,
  NotFound,
  ForgotPassword,
  ResetPasswordPage,
  Unauthorized,
  BookingFailure,
} from "./index.ts";
import ProtectedRoute from "@/pages/auth/ProtectedRoute.tsx";
import RoleRoute from "./RoleRoute.tsx";
import { ownwerRoutes } from "./routes.tsx";
import OwnerInitializer from "@/pages/auth/OwnerInitializer.tsx";
import ScrollToTop from "@/components/common/ScrollToTop.tsx";

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/salons/:salonId" element={<SalonDetailsPage />} />
          <Route path="/salons/:id/book" element={<BookingWizard />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="/booking-success/:bookingId"
              element={<BookingSuccess />}
            />
            <Route path="/booking-failure" element={<BookingFailure />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/bookings" element={<CustomerBookings />} />
            <Route element={<OwnerInitializer />}>
              <Route
                path="/owner"
                element={
                  <RoleRoute allowedRoles={["owner"]}>
                    <Outlet />
                  </RoleRoute>
                }
              >
                {ownwerRoutes.map((route, index) => (
                  <Route
                    key={index}
                    path={route.path}
                    element={route.element}
                  />
                ))}
              </Route>
            </Route>
          </Route>
        </Route>

        {/* Auth Layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
