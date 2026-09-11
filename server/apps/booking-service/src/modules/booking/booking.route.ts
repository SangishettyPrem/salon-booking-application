import Router from "express";
import * as bookingController from "./booking.controller.js";
import { allowedRoles, attachUser } from "@/middlewares/auth.middleware.js";
import { validate } from "@/middlewares/validate.middleware.js";
import {
  createBookingSchema,
  updateBookingStatusSchema,
} from "./booking.schema.js";

const router = Router();

// Owner Dashboard & Bookings Routes (Placed before `/:id` so "owner" is not captured as id)
router.get(
  "/owner/dashboard",
  attachUser,
  allowedRoles("owner"),
  bookingController.getOwnerDashboardStats,
);

router.get(
  "/owner",
  attachUser,
  allowedRoles("owner"),
  bookingController.getOwnerBookings,
);

// Customer Bookings Routes
router.get("/my", attachUser, bookingController.getMyBookings);

router.post(
  "/",
  attachUser,
  validate(createBookingSchema),
  bookingController.createBooking,
);

router.patch("/:bookingId/cancel", attachUser, bookingController.cancelBooking);

// Owner update status
router.patch(
  "/:bookingId/status",
  attachUser,
  allowedRoles("owner"),
  validate(updateBookingStatusSchema),
  bookingController.updateBookingStatus,
);

// Public Salon Availability Route (Dates & Timings)
router.get("/availability", bookingController.getSalonAvailability);
router.get(
  "/salon/:salonId/availability",
  bookingController.getSalonAvailability,
);

router.get("/:id", attachUser, bookingController.getBookingById);

export default router;
