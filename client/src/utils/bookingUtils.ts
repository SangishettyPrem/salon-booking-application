import type {
  BusinessHours,
  DaySchedule,
  DayOfWeek,
} from "@/redux/features/salon/salon.types";
import { DAYS_OF_WEEK } from "@/redux/features/salon/salon.types";

export interface AvailableDate {
  fullDate: string; // "YYYY-MM-DD"
  dayName: string; // "Mon", "Tue"
  dayNum: number; // 15
  monthName: string; // "Sep"
  isToday: boolean;
  isOpen: boolean;
}

export interface CategorizedSlots {
  morning: string[];
  afternoon: string[];
  evening: string[];
  all: string[];
}

export interface FormattedDaySchedule {
  key: DayOfWeek;
  label: string;
  short: string;
  isOpen: boolean;
  timeText: string;
  isToday: boolean;
}

// Maps JavaScript Date.getDay() (0 = Sunday, 1 = Monday, ...) to DayOfWeek key
export const DAY_INDEX_TO_KEY: DayOfWeek[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/**
 * Returns DaySchedule for a given Date from BusinessHours
 */
export const getDaySchedule = (
  date: Date,
  businessHours?: BusinessHours,
): DaySchedule | null => {
  if (!businessHours) return null;
  const dayKey = DAY_INDEX_TO_KEY[date.getDay()];
  return businessHours[dayKey] || null;
};

/**
 * Checks if a salon is open on a given date based on businessHours object or legacy workingDays string
 */
export const isSalonOpenOnDay = (
  date: Date,
  scheduleSource?: BusinessHours | string,
): boolean => {
  if (!scheduleSource) return true;

  // 1. BusinessHours object check
  if (typeof scheduleSource === "object") {
    const dayKey = DAY_INDEX_TO_KEY[date.getDay()];
    const daySchedule = scheduleSource[dayKey];
    if (daySchedule !== undefined) {
      return Boolean(daySchedule.isOpen);
    }
    return true;
  }

  // 2. Legacy string pattern fallback
  const dayOfWeek = date.getDay();
  const pattern = scheduleSource.trim().toLowerCase();

  if (pattern.includes("all 7 days") || pattern.includes("monday - sunday")) {
    return true;
  }
  if (pattern.includes("sunday closed")) {
    return dayOfWeek !== 0;
  }
  if (pattern.includes("monday closed")) {
    return dayOfWeek !== 1;
  }
  if (
    pattern.includes("weekdays only") ||
    pattern.includes("monday - friday")
  ) {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }
  if (pattern.includes("tuesday closed")) {
    return dayOfWeek !== 2;
  }

  return true;
};

/**
 * Generates the upcoming N days with open/closed status
 */
export const generateAvailableDates = (
  scheduleSource?: BusinessHours | string,
  daysCount = 14,
): AvailableDate[] => {
  const dates: AvailableDate[] = [];
  const today = new Date();

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const fullDate = `${year}-${month}-${day}`;

    const isOpen = isSalonOpenOnDay(d, scheduleSource);

    dates.push({
      fullDate,
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: d.getDate(),
      monthName: d.toLocaleDateString("en-US", { month: "short" }),
      isToday: i === 0,
      isOpen,
    });
  }

  return dates;
};

/**
 * Returns today's open status and display hours
 */
export const getTodaySchedule = (
  businessHours?: BusinessHours,
): { isOpen: boolean; text: string } => {
  if (!businessHours) {
    return { isOpen: false, text: "Timings not set" };
  }

  const today = new Date();
  const dayKey = DAY_INDEX_TO_KEY[today.getDay()];
  const todaySchedule = businessHours[dayKey];

  if (!todaySchedule || !todaySchedule.isOpen) {
    return { isOpen: false, text: "Closed Today" };
  }

  if (todaySchedule.openingTime && todaySchedule.closingTime) {
    return {
      isOpen: true,
      text: `${todaySchedule.openingTime} - ${todaySchedule.closingTime}`,
    };
  }

  return { isOpen: true, text: "Timings not set" };
};

/**
 * Formats a weekly Monday-Sunday schedule array for UI display
 */
export const formatWeeklySchedule = (
  businessHours?: BusinessHours,
): FormattedDaySchedule[] => {
  const todayKey = DAY_INDEX_TO_KEY[new Date().getDay()];

  return DAYS_OF_WEEK.map(({ key, label, short }) => {
    const schedule = businessHours?.[key];
    const isOpen = schedule ? Boolean(schedule.isOpen) : false;
    const timeText =
      isOpen && schedule?.openingTime && schedule?.closingTime
        ? `${schedule.openingTime} - ${schedule.closingTime}`
        : isOpen
          ? "Timings not set"
          : "Closed";

    return {
      key,
      label,
      short,
      isOpen,
      timeText,
      isToday: key === todayKey,
    };
  });
};

/**
 * Parses time string formatted as "hh:mm AM/PM" (e.g. "06:00 AM", "10:30 PM") into minutes from midnight
 */
export const parseTimeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return 9 * 60; // default 09:00 AM (540 mins)

  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 9 * 60;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours < 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

/**
 * Converts minutes from midnight into "hh:mm AM/PM" format
 */
export const formatMinutesToTime = (totalMinutes: number): string => {
  const hours24 = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const period = hours24 >= 12 ? "PM" : "AM";
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;

  const paddedHours = String(hours12).padStart(2, "0");
  const paddedMins = String(mins).padStart(2, "0");

  return `${paddedHours}:${paddedMins} ${period}`;
};

/**
 * Dynamically generates time slots between openingTime and closingTime with a step interval
 */
export const generateTimeSlots = (
  openingTime = "09:00 AM",
  closingTime = "09:00 PM",
  intervalMinutes = 45,
): CategorizedSlots => {
  const startMinutes = parseTimeToMinutes(openingTime);
  const endMinutes = parseTimeToMinutes(closingTime);

  const morning: string[] = [];
  const afternoon: string[] = [];
  const evening: string[] = [];
  const all: string[] = [];

  // Stop slots early enough so the last session doesn't overshoot closing
  for (
    let current = startMinutes;
    current <= endMinutes - intervalMinutes;
    current += intervalMinutes
  ) {
    const formatted = formatMinutesToTime(current);
    all.push(formatted);

    // Morning: before 12:00 PM (720 mins)
    if (current < 720) {
      morning.push(formatted);
    }
    // Afternoon: 12:00 PM to 04:30 PM (720 to 990 mins)
    else if (current < 990) {
      afternoon.push(formatted);
    }
    // Evening: 04:30 PM onwards
    else {
      evening.push(formatted);
    }
  }

  return { morning, afternoon, evening, all };
};

/**
 * Checks if a slot time is in the past for today
 */
export const isSlotPast = (slotTime: string, selectedDate: string): boolean => {
  if (!selectedDate || !slotTime) return false;

  const todayStr = new Date().toISOString().split("T")[0];
  if (selectedDate !== todayStr) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const slotMinutes = parseTimeToMinutes(slotTime);

  // Add 15 mins buffer
  return slotMinutes <= currentMinutes + 15;
};

/**
 * Returns the first available open date from the list
 */
export const getFirstOpenDate = (dates: AvailableDate[]): string => {
  const openDate = dates.find((d) => d.isOpen);
  return openDate ? openDate.fullDate : dates[0]?.fullDate || "";
};
