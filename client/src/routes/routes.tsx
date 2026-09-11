import {
  Dashboard,
  Booking,
  SalonProfile,
  Services,
  Staff,
  Payments,
} from "./index";

export const ownwerRoutes = [
  {
    path: "",
    element: <Dashboard />,
  },
  {
    path: "bookings",
    element: <Booking />,
  },
  {
    path: "services",
    element: <Services />,
  },
  {
    path: "staff",
    element: <Staff />,
  },
  {
    path: "payments",
    element: <Payments />,
  },
  {
    path: "profile",
    element: <SalonProfile />,
  },
];
