import { useState, useEffect } from "react";
import { Clock, MoveLeft } from "lucide-react";
import { getSalonAvailabilityAPI } from "@/redux/features/bookings/booking.api";
import type { Salon } from "@/redux/features/salon/salon.types";
import { getDaySchedule, generateAvailableDates } from "@/utils/bookingUtils";
import type {
  TimeSlot,
  SalonAvailabilityData,
} from "@/redux/features/bookings/bookings.types";

interface BookingSlotPickerProps {
  salon: Salon;
  selectedDate: string;
  selectedSlot: string;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: string) => void;
  slotDuration: number;
  onBack: () => void;
}

const BookingSlotPicker = ({
  salon,
  selectedDate,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
  slotDuration,
  onBack,
}: BookingSlotPickerProps) => {
  const [availableDates, setAvailableDates] = useState<any[]>(() => {
    const rawDates = generateAvailableDates(salon?.businessHours, 14);
    return rawDates.map((d) => ({
      date: d.fullDate,
      dayShort: d.dayName,
      dayNumber: d.dayNum,
      isOpen: d.isOpen,
    }));
  });
  const [availability, setAvailability] =
    useState<SalonAvailabilityData | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync available dates if salon changes
  useEffect(() => {
    if (!salon) return;
    const rawDates = generateAvailableDates(salon.businessHours, 14);
    const formatted = rawDates.map((d) => ({
      date: d.fullDate,
      dayShort: d.dayName,
      dayNumber: d.dayNum,
      isOpen: d.isOpen,
    }));
    setAvailableDates(formatted);

    // If no date selected, auto-select first open date
    if (!selectedDate) {
      const firstOpen = formatted.find((d) => d.isOpen);
      if (firstOpen) {
        onSelectDate(firstOpen.date);
      }
    }
  }, [salon?._id, salon?.businessHours]);

  useEffect(() => {
    if (!salon || !salon._id || !selectedDate) return;

    // Check if the selected date is open according to day-by-day businessHours
    const dateObj = new Date(`${selectedDate}T00:00:00`);
    const daySchedule = getDaySchedule(dateObj, salon.businessHours);
    const isDayOpen = daySchedule ? daySchedule.isOpen : true;

    if (!isDayOpen) {
      setSlots([]);
      setAvailability({
        date: selectedDate,
        isOpen: false,
        openingTime: null,
        closingTime: null,
        slots: [],
      });
      return;
    }

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const res = await getSalonAvailabilityAPI({
          salonId: salon._id,
          date: selectedDate,
          slotDuration,
        });

        if (res.data && res.data.success && res.data.data) {
          const data = res.data.data;
          setAvailability(data);
          setSlots(Array.isArray(data.slots) ? data.slots : []);
        } else {
          setAvailability(null);
          setSlots([]);
        }
      } catch (err) {
        console.error("Failed to load availability from backend:", err);
        setAvailability(null);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [salon?._id, salon?.businessHours, selectedDate, slotDuration]);

  // Check if current selected date is closed
  const isCurrentDateClosed =
    availability !== null && availability.date === selectedDate
      ? !availability.isOpen
      : selectedDate
        ? !getDaySchedule(
            new Date(`${selectedDate}T00:00:00`),
            salon?.businessHours,
          )?.isOpen
        : false;

  const availableCount = slots.filter((s) => s.available).length;

  return (
    <div className="space-y-6">
      {/* 1. Dynamic Date Picker */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 rounded-lg hover:bg-(--soft) text-(--ink) transition-colors cursor-pointer"
        >
          <MoveLeft size={19} />
        </button>
        <h2 className="text-lg font-bold text-(--ink)">Step 3: Select Date</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {availableDates.map((day) => (
          <button
            key={day.date}
            type="button"
            disabled={!day.isOpen}
            onClick={() => {
              onSelectDate(day.date);
              onSelectSlot("");
            }}
            className={`flex flex-col items-center px-4 py-2.5 rounded-xl border text-sm transition-all shrink-0 ${
              selectedDate === day.date
                ? "bg-rose-600 text-white border-rose-600 shadow-md"
                : day.isOpen
                  ? "border-gray-200 hover:border-rose-400 bg-white dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer"
                  : "opacity-40 cursor-not-allowed bg-gray-100 dark:bg-zinc-800/40 border-gray-200 dark:border-zinc-700 text-gray-400 dark:text-zinc-500"
            }`}
          >
            <span className="text-xs uppercase">{day.dayShort}</span>
            <span className="text-lg font-bold">{day.dayNumber}</span>
            {!day.isOpen && <span className="text-[10px]">Closed</span>}
          </button>
        ))}
      </div>

      {/* 2. Dynamic Time Slots */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Select Time Slot</h4>
            {!loading && slots.length > 0 && !isCurrentDateClosed && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                {availableCount} available
              </span>
            )}
          </div>
          {availability?.openingTime &&
            availability?.closingTime &&
            !isCurrentDateClosed && (
              <span className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                <Clock size={12} className="text-rose-500" />
                <span>
                  Hours: {availability.openingTime} - {availability.closingTime}
                </span>
              </span>
            )}
        </div>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 animate-pulse"
              />
            ))}
          </div>
        ) : isCurrentDateClosed ? (
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-700 text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Salon is closed on this day.
            </p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
              Please choose another date from the available days above.
            </p>
          </div>
        ) : slots.length === 0 ? (
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-700 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              No time slots available for this date.
            </p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
              Try choosing another date or adjusting your selected services.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {slots.map((slot) => {
              const isSelected = selectedSlot === slot.time;
              const isAvailable = slot.available;

              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onSelectSlot(slot.time)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-rose-600 text-white border-rose-600 shadow-xs font-bold"
                      : isAvailable
                        ? "bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:border-rose-400 text-gray-800 dark:text-gray-200 cursor-pointer"
                        : "bg-gray-100 dark:bg-zinc-800/40 border-gray-200 dark:border-zinc-700 text-gray-400 dark:text-zinc-500 cursor-not-allowed line-through"
                  }`}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSlotPicker;
