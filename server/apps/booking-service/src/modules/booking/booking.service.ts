import { Types } from "mongoose";
import { AppError } from "@/handlers/AppError.js";
import BookingModel, {
  BOOKING_STATUSES,
  type BookingStatus,
} from "./booking.model.js";
import type {
  CreateBookingRequest,
  UpdateBookingPaymentStatusRequest,
  GetAvailabilityParams,
  GetSalonBusinessHoursResponse,
  Days,
} from "./booking.types.js";
import { publishBookingEvent } from "@/publisher/booking.publish.js";
import { acquireLock, releaseLock } from "@/utils/redisLock.js";
import { redis } from "@/config/redis.js";
import { getDayKey, minutesToTime, timeToMinutes } from "@/utils/time.utils.js";
import { getSalonBusinessHours } from "@/clients/salon.client.js";

// Generate unique readable booking code like BK-89401
const generateBookingCode = async (): Promise<string> => {
  let unique = false;
  let code = "";
  while (!unique) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    code = `BK-${randomNum}`;
    const exists = await BookingModel.findOne({ bookingCode: code });
    if (!exists) {
      unique = true;
    }
  }
  return code;
};

export const createBooking = async (
  customerId: string,
  data: CreateBookingRequest,
) => {
  const lockKey = [
    "booking:lock",
    data.salonId,
    data.staffName,
    data.date,
    data.time,
  ].join(":");

  const lockValue = await acquireLock(lockKey, 15);
  if (!lockValue) {
    throw new AppError(
      "This time slot is currently being booked. Please try again.",
      409,
    );
  }
  try {
    // 1. Check whether the slot is already booked
    const existingBooking = await BookingModel.findOne({
      salonId: new Types.ObjectId(data.salonId),
      staffName: data.staffName,
      date: data.date,
      time: data.time,
      status: {
        $in: ["Confirmed", "Pending"],
      },
    }).exec();

    if (existingBooking) {
      throw new AppError("This time slot is already booked.", 409);
    }

    // Check if slot has already passed
    const slotMinutes = parseTimeToMinutes(data.time);
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (
      data.date < todayStr ||
      (data.date === todayStr &&
        slotMinutes <= now.getHours() * 60 + now.getMinutes())
    ) {
      throw new AppError(
        "Cannot book an appointment for a past date or time.",
        400,
      );
    }
    // 2. Generate booking code
    let bookingCode = await generateBookingCode();

    const isOnlinePayment = data.paymentMethod === "Razorpay Online";
    const isPaid =
      data.paymentStatus === "Paid" ||
      (isOnlinePayment && Boolean(data.razorpayPaymentId));
    const bookingStatus = isOnlinePayment ? "Pending" : "Confirmed";

    // 3. Creating booking
    const booking = await BookingModel.create({
      ...data,
      bookingCode,
      customerId: new Types.ObjectId(customerId),
      salonId: new Types.ObjectId(data.salonId),
      status: bookingStatus,
      paymentStatus: isPaid ? "Paid" : "Pending",
      paymentMethod: data.paymentMethod || "Pay at Salon",
    });

    return booking;
  } catch (error) {
    throw error;
  } finally {
    // Releasing Lock
    await releaseLock(lockKey, lockValue);
  }
};

export const getMyBookings = async (customerId: string) => {
  try {
    const bookings = await BookingModel.find({
      customerId: new Types.ObjectId(customerId),
    }).sort({ createdAt: -1 });

    return bookings;
  } catch (error) {
    throw error;
  }
};

export const getBookingById = async (
  bookingId: string,
  userId?: string,
  role?: string,
) => {
  try {
    let query: any = {};
    if (Types.ObjectId.isValid(bookingId)) {
      query = { _id: new Types.ObjectId(bookingId) };
    } else {
      query = { bookingCode: bookingId.toUpperCase() };
    }

    const booking = await BookingModel.findOne(query);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    // Role check if provided (allow admin, or owner, or booking's customer)
    if (
      userId &&
      role === "customer" &&
      booking.customerId.toString() !== userId
    ) {
      throw new AppError("Access denied to this booking", 403);
    }

    return booking;
  } catch (error) {
    throw error;
  }
};

export const cancelBooking = async (bookingId: string, customerId: string) => {
  try {
    const booking = await BookingModel.findOne({
      _id: new Types.ObjectId(bookingId),
      customerId: new Types.ObjectId(customerId),
    });
    if (!booking) {
      throw new AppError("Booking not found or unauthorized", 404);
    }

    if (booking.status === "Cancelled") {
      throw new AppError("Booking is already cancelled", 400);
    }

    if (booking.status === "Completed") {
      throw new AppError("Completed appointments cannot be cancelled", 400);
    }

    booking.status = "Cancelled";
    await booking.save();

    return booking;
  } catch (error) {
    throw error;
  }
};

export interface GetOwnerBookingsFilters {
  salonId?: string | undefined;
  date?: string | undefined;
  status?: string | undefined;
  search?: string | undefined;
}

export const getOwnerBookings = async (filters: GetOwnerBookingsFilters) => {
  try {
    const query: any = {};

    if (filters.salonId && Types.ObjectId.isValid(filters.salonId)) {
      query.salonId = new Types.ObjectId(filters.salonId);
    }

    if (filters.date) {
      query.date = filters.date;
    }

    if (filters.status && filters.status !== "All") {
      query.status = filters.status;
    }

    if (filters.search) {
      const regex = new RegExp(filters.search.trim(), "i");
      query.$or = [
        { bookingCode: regex },
        { customerName: regex },
        { customerPhone: regex },
        { serviceName: regex },
      ];
    }

    const bookings = await BookingModel.find(query).sort({
      date: -1,
      time: -1,
      createdAt: -1,
    });

    // Calculate metrics
    const totalBookings = bookings.length;
    const confirmedCount = bookings.filter(
      (b) => b.status === "Confirmed",
    ).length;
    const completedCount = bookings.filter(
      (b) => b.status === "Completed",
    ).length;
    const cancelledCount = bookings.filter(
      (b) => b.status === "Cancelled",
    ).length;
    const totalRevenue = bookings
      .filter(
        (b) =>
          b.status !== "Cancelled" &&
          (b.paymentStatus === "Paid" || b.status === "Completed"),
      )
      .reduce((sum, b) => sum + (b.price || 0), 0);

    return {
      bookings,
      summary: {
        totalBookings,
        confirmedCount,
        completedCount,
        cancelledCount,
        totalRevenue,
      },
    };
  } catch (error) {
    throw error;
  }
};

export const updateBookingStatus = async (
  bookingId: string,
  newStatus: string,
) => {
  if (!BOOKING_STATUSES.includes(newStatus as BookingStatus)) {
    throw new AppError(`Invalid status: ${newStatus}`, 400, "INVALID_STATUS");
  }

  const booking = await BookingModel.findById(bookingId);
  if (!booking) {
    throw new AppError("Booking not found", 404, "BOOKING_NOT_FOUND");
  }

  if (booking.status === "Completed") {
    throw new AppError(
      "Completed bookings are finalized and cannot be modified",
      400,
      "BOOKING_ALREADY_COMPLETED",
    );
  }

  booking.status = newStatus as BookingStatus;
  await booking.save();

  publishBookingEvent(`booking.${newStatus.toLowerCase()}`, {
    serviceName: booking.serviceName,
    slotTime: booking.time,
    date: booking.date,
    price: booking.price,
    bookingCode: booking.bookingCode,
    customerName: booking.customerName,
    salonName: booking.salonName,
    email: booking.customerEmail,
  });

  return booking;
};

export const updatePaymentStatus = async (
  payload: UpdateBookingPaymentStatusRequest,
) => {
  try {
    const { bookingId, paymentStatus, razorpayOrderId, razorpayPaymentId } =
      payload;
    if (!Types.ObjectId.isValid(bookingId)) {
      throw new AppError("Invalid booking ID", 400);
    }

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    booking.paymentStatus = paymentStatus;
    booking.razorpayOrderId = razorpayOrderId;
    booking.razorpayPaymentId = razorpayPaymentId;

    await booking.save();
    return booking;
  } catch (error) {
    throw error;
  }
};

export const getOwnerDashboardStats = async (
  salonId?: string,
  ownerId?: string,
) => {
  try {
    const query: Record<string, any> = {};

    if (salonId && Types.ObjectId.isValid(salonId)) {
      query.salonId = new Types.ObjectId(salonId);
    }

    // Fetch all bookings for this salon
    const allBookings = await BookingModel.find(query).sort({
      date: -1,
      time: -1,
      createdAt: -1,
    });

    // Today's Date String (YYYY-MM-DD in local/server time)
    const todayStr = new Date().toISOString().split("T")[0];

    // Today's Bookings
    const todayBookingsList = allBookings.filter((b) => b.date === todayStr);
    const todayBookingsCount = todayBookingsList.length;

    // Today's Revenue (Non-cancelled, Paid or Completed)
    const todayRevenue = todayBookingsList
      .filter(
        (b) =>
          b.status !== "Cancelled" &&
          (b.paymentStatus === "Paid" || b.status === "Completed"),
      )
      .reduce((sum, b) => sum + (b.price || 0), 0);

    // Upcoming Bookings (Dates after today that are not cancelled)
    const upcomingBookingsCount = allBookings.filter(
      (b) => b.date > todayStr! && b.status !== "Cancelled",
    ).length;

    // All-time metrics
    const totalRevenue = allBookings
      .filter(
        (b) =>
          b.status !== "Cancelled" &&
          (b.paymentStatus === "Paid" || b.status === "Completed"),
      )
      .reduce((sum, b) => sum + (b.price || 0), 0);

    const totalBookingsCount = allBookings.length;
    const pendingCount = allBookings.filter(
      (b) => b.status === "Pending",
    ).length;
    const completedCount = allBookings.filter(
      (b) => b.status === "Completed",
    ).length;

    return {
      stats: {
        todayBookings: todayBookingsCount,
        todayRevenue,
        upcomingBookings: upcomingBookingsCount,
        totalRevenue,
        totalBookings: totalBookingsCount,
        pendingBookings: pendingCount,
        completedBookings: completedCount,
      },
    };
  } catch (error) {
    throw error;
  }
};

export const parseTimeToMinutes = (timeStr: string): number => {
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes("PM");
  const isAM = clean.includes("AM");

  const timePart = clean.replace(/[AP]M/, "").trim();
  const [hStr = "0", mStr = "0"] = timePart.split(":");
  let hours = parseInt(hStr || "0", 10) || 0;
  const minutes = parseInt(mStr || "0", 10) || 0;

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

export const getAvailability = async ({
  salonId,
  date,
  slotDuration = 30,
}: GetAvailabilityParams) => {
  const salon = (await getSalonBusinessHours(
    salonId,
  )) as GetSalonBusinessHoursResponse;

  const dayKey = getDayKey(date) as Days;
  const schedule = salon.businessHours[dayKey];

  if (!schedule || !schedule.isOpen) {
    return {
      date,
      isOpen: false,
      openingTime: null,
      closingTime: null,
      slots: [],
    };
  }

  const bookings = await BookingModel.find({
    salonId: new Types.ObjectId(salonId),
    date,
    status: {
      $in: ["Pending", "Confirmed"],
    },
  })
    .select("time durationMinutes")
    .lean();

  const openingMinutes = timeToMinutes(schedule.openingTime);
  const closingMinutes = timeToMinutes(schedule.closingTime);

  const duration = Number(slotDuration) || 30;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const currentMinutesToday = now.getHours() * 60 + now.getMinutes();
  const isDateToday = date === todayStr;
  const isPastDate = date < todayStr;

  const slots = [];
  for (
    let current = openingMinutes;
    current < closingMinutes;
    current += duration
  ) {
    const slotEnd = current + duration;

    if (slotEnd > closingMinutes) {
      break;
    }

    const time = minutesToTime(current);

    const isBooked = bookings.some((booking) => {
      const bookingStart = timeToMinutes(booking.time);
      const bookingEnd =
        bookingStart + (Number(booking.durationMinutes) || duration);

      return current < bookingEnd && slotEnd > bookingStart;
    });

    const isPast =
      isPastDate || (isDateToday && current <= currentMinutesToday);

    slots.push({
      time,
      available: !isBooked && !isPast,
    });
  }
  return {
    date,
    isOpen: true,
    openingTime: schedule.openingTime,
    closingTime: schedule.closingTime,
    slots,
  };
};
