import React, { useState, useEffect, useMemo } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import type { Service as SalonService } from "@/redux/features/services/services.types";
import type { StaffMember } from "@/redux/features/staff/staff.types";
import type { Salon } from "@/redux/features/salon/salon.types";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import { getSalonById } from "@/redux/features/salon/salon.slice";
import { handleError } from "@/utils/handleResponse";
import {
  BookingStepIndicator,
  Step1SelectServices,
  Step2SelectStylist,
  BookingSlotPicker,
  BookingSummaryCard,
  generateAvailableDates,
  getFirstOpenDate,
} from "@/components/booking";
import { AuthModal } from "@/components/common/AuthModal";

const BookingWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { publicSalons, isPublicSalonsLoading } = useAppSelector(
    (state) => state.salon,
  );

  // Retrieve salon from router location state or Redux cache
  const routerSalon = location.state?.salon as Salon | undefined;
  const cachedSalon = id ? publicSalons[id] : undefined;
  const salon = routerSalon || cachedSalon;

  // Fetch salon if not present in memory
  useEffect(() => {
    if (id && !salon) {
      dispatch(getSalonById(id));
    }
  }, [id, salon, dispatch]);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Step 1: Selected Services
  const [selectedServices, setSelectedServices] = useState<SalonService[]>([]);

  // Step 2: Selected Stylist
  const [selectedStylist, setSelectedStylist] = useState<StaffMember | "any">(
    "any",
  );

  // Step 3: Date & Slot
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // Pre-select service from query param (e.g. ?serviceId=...)
  useEffect(() => {
    if (
      salon?.services &&
      salon.services.length > 0 &&
      selectedServices.length === 0
    ) {
      const serviceId = searchParams.get("serviceId");
      if (serviceId) {
        const matched = salon.services.find((s) => s._id === serviceId);
        if (matched) {
          setSelectedServices([matched]);
          return;
        }
      }
      // Default to first service
      setSelectedServices([salon.services[0]]);
    }
  }, [salon, searchParams, selectedServices.length]);

  // Auto-initialize selectedDate to the first available open date
  useEffect(() => {
    if (salon && !selectedDate) {
      const dates = generateAvailableDates(salon.businessHours, 14);
      const firstOpen = getFirstOpenDate(dates);
      if (firstOpen) {
        setSelectedDate(firstOpen);
      }
    }
  }, [salon, selectedDate]);

  // Duration & Cost Calculation
  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [selectedServices]);

  const subtotal = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  const tax = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);
  const total = subtotal + tax;

  const handleToggleService = (service: SalonService) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s._id === service._id);
      if (exists) {
        if (prev.length === 1) return prev; // Must keep at least one service
        return prev.filter((s) => s._id !== service._id);
      }
      return [...prev, service];
    });
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (selectedServices.length === 0) {
        return handleError("Please select at least one treatment service.");
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!selectedDate) {
        return handleError("Please select a date for your appointment.");
      }
      if (!selectedSlot) {
        return handleError("Please select an available time slot.");
      }

      if (!salon) return;

      // Save checkout payload to sessionStorage
      const checkoutData = {
        salon: {
          id: salon._id,
          name: salon.name,
          address: `${salon.addressLine1}, ${salon.city}`,
          phone: salon.phone,
        },
        services: selectedServices,
        stylist:
          selectedStylist === "any"
            ? { name: "Any Available Stylist", role: "Specialist" }
            : selectedStylist,
        appointment: {
          date: selectedDate,
          time: selectedSlot,
          durationMinutes: totalDuration,
        },
        customer: {
          name: user?.name || "",
          phone: user?.phone || "",
          email: user?.email || "",
        },
        pricing: {
          subtotal,
          tax,
          total,
        },
      };

      sessionStorage.setItem("glowbook_checkout", JSON.stringify(checkoutData));

      // If user is not logged in, prompt inline AuthModal
      if (!user) {
        setIsAuthModalOpen(true);
      } else {
        navigate("/checkout");
      }
    }
  };

  if (isPublicSalonsLoading && !salon) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="size-10 rounded-full border-3 border-(--rose) border-t-transparent animate-spin" />
        <p className="text-xs text-(--muted)">Loading booking details...</p>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-xs text-(--muted)">
          Salon information could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-8 pb-24">
      {/* 1. Header & Stepper */}
      <BookingStepIndicator
        salonId={salon._id}
        salonName={salon.name}
        currentStep={currentStep}
      />

      {/* 2. Wizard Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Active Step */}
        <div className="lg:col-span-8 space-y-6">
          {currentStep === 1 && (
            <Step1SelectServices
              services={salon.services || []}
              selectedServices={selectedServices}
              onToggleService={handleToggleService}
            />
          )}

          {currentStep === 2 && (
            <Step2SelectStylist
              staff={salon.staff || []}
              selectedStylist={selectedStylist}
              onSelectStylist={setSelectedStylist}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <BookingSlotPicker
              salon={salon}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onSelectDate={setSelectedDate}
              onSelectSlot={setSelectedSlot}
              slotDuration={totalDuration}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>

        {/* RIGHT: Sticky Live Summary */}
        <BookingSummaryCard
          salon={salon}
          selectedServices={selectedServices}
          selectedStylist={selectedStylist}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          totalDuration={totalDuration}
          subtotal={subtotal}
          tax={tax}
          total={total}
          currentStep={currentStep}
          onNext={handleNextStep}
        />
      </div>

      {/* 3. Inline Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          navigate("/checkout");
        }}
      />
    </div>
  );
};

export default BookingWizard;
