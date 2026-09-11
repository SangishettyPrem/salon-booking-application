import type { NextFunction, Request, Response } from "express";
import * as bookingService from "./booking.service.js";
import type { GetAvailabilityParams } from "./booking.types.js";

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customerId = req.user?._id;
    if (!customerId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const booking = await bookingService.createBooking(customerId, req.body);
    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customerId = req.user?._id;
    if (!customerId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const bookings = await bookingService.getMyBookings(customerId);
    return res.status(200).json({
      success: true,
      message: "Customer bookings fetched successfully",
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Booking ID or Code is required" });
    }
    const userId = req.user?._id;
    const role = req.user?.role;
    const booking = await bookingService.getBookingById(id, userId, role);
    return res.status(200).json({
      success: true,
      message: "Booking details fetched successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (
  req: Request<{ bookingId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { bookingId } = req.params;
    const customerId = req.user?._id;
    if (!bookingId) {
      return res
        .status(400)
        .json({ success: false, message: "Booking ID is required" });
    }
    if (!customerId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const booking = await bookingService.cancelBooking(bookingId, customerId);
    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getOwnerBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const salonId = (req.query.salonId as string) || undefined;
    const date = (req.query.date as string) || undefined;
    const status = (req.query.status as string) || undefined;
    const search = (req.query.search as string) || undefined;

    const result = await bookingService.getOwnerBookings({
      salonId,
      date,
      status,
      search,
    });

    return res.status(200).json({
      success: true,
      message: "Owner appointments fetched successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (
  req: Request<{ bookingId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    const updatedBooking = await bookingService.updateBookingStatus(
      bookingId,
      status,
    );

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status} successfully.`,
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const getOwnerDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const salonId = (req.query.salonId as string) || undefined;
    const ownerId = req.user?._id;

    const data = await bookingService.getOwnerDashboardStats(salonId, ownerId);

    return res.status(200).json({
      success: true,
      message: "Owner dashboard statistics fetched successfully",
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

export const getSalonAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { salonId, date, slotDuration } =
      req.query as unknown as GetAvailabilityParams;

    if (!salonId || typeof salonId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Salon ID is required",
      });
    }

    if (!date || typeof date !== "string") {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const availability = await bookingService.getAvailability({
      salonId,
      date,
      slotDuration: Number(slotDuration) || 30,
    });

    return res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};
