import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Lock,
  Zap,
  User,
  LogIn,
} from "lucide-react";
import { formatCurrency } from "@/utils";
import { handleSuccess, handleError } from "@/utils/handleResponse";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import { createBooking } from "@/redux/features/bookings/bookings.slice";
import type {
  Booking,
  CreateBookingRequest,
} from "@/redux/features/bookings/bookings.types";
import type { Service } from "@/redux/features/services/services.types";
import type {
  PaymentMethod,
  PaymentStatus,
} from "@/redux/features/payment/payment.types";
import {
  createPaymentOrder,
  verifyPayment,
} from "@/redux/features/payment/payment.slice";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [checkoutData, setCheckoutData] = useState<any>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("glowbook_checkout");
    if (!raw) {
      navigate("/");
      return;
    }
    try {
      setCheckoutData(JSON.parse(raw));
    } catch {
      navigate("/");
    }
  }, [navigate]);

  // Ensure Razorpay SDK is loaded
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const existing = document.querySelector(
        'script[src*="checkout.razorpay.com"]',
      );
      if (existing) {
        if ((existing as any).loaded || window.Razorpay) return resolve(true);
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => resolve(false));
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Price Calculations
  const calculations = useMemo(() => {
    if (!checkoutData)
      return { subtotal: 0, tax: 0, discount: 0, finalTotal: 0 };
    const sub = checkoutData.pricing.subtotal;
    const tax = checkoutData.pricing.tax;

    const finalTotal = Math.max(0, sub + tax - 0);
    return { subtotal: sub, tax, discount: 0, finalTotal };
  }, [checkoutData]);

  if (!checkoutData) return null;

  // Execute Razorpay Payment
  const handlePayment = async () => {
    // If not logged in, prompt user to login
    if (!user) {
      handleError(
        "Please sign in to your account to complete your reservation.",
      );
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    setIsProcessing(true);

    const newBookingRecord: CreateBookingRequest = {
      salonId: checkoutData.salon.id as string,
      salonName: checkoutData.salon.name as string,
      salonAddress: checkoutData.salon.address as string,
      salonPhone: checkoutData.salon.phone as string,
      customerId: user._id,
      customerName: user.name as string,
      customerPhone: user.phone as string,
      customerEmail: user.email as string,
      serviceName: checkoutData.services.map((s: Service) => s.name),
      staffName: checkoutData.stylist.name,
      date: checkoutData.appointment.date,
      time: checkoutData.appointment.time,
      durationMinutes: checkoutData.appointment.durationMinutes,
      price: calculations.finalTotal,
      status: "Pending",
      paymentStatus: "Pending" as PaymentStatus,
      paymentMethod,
    };

    // If Pay at Salon chosen
    if (paymentMethod === "at_salon") {
      const booking = await saveBooking(newBookingRecord);
      if (!booking) {
        setIsProcessing(false);
        return;
      }
      clearCheckoutStorage();
      handleSuccess("Booking confirmed! You can pay at the salon.");
      bookingNavigation("success", booking);
      return;
    }

    // Razorpay Online Flow
    const idempotencyKey = crypto.randomUUID();
    try {
      // Step 1: Ensure Razorpay SDK script is ready
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        setIsProcessing(false);
        handleError(
          "Failed to load Razorpay SDK. Please check your network and retry.",
        );
        return;
      }

      // Save Booking Record
      const booking = await saveBooking(newBookingRecord);

      if (!booking) {
        setIsProcessing(false);
        return;
      }

      // Step 2: Create Order via payment API
      const { success, order, message } = await dispatch(
        createPaymentOrder({
          data: {
            amount: calculations.finalTotal,
            bookingId: booking._id,
            bookingCode: booking.bookingCode,
            salonId: checkoutData.salon.id,
            customerName: user.name,
            customerPhone: user.phone,
            serviceName: checkoutData.services.map((s: Service) => s.name),
          },
          idempotencyKey,
        }),
      ).unwrap();

      if (!success) {
        setIsProcessing(false);
        handleError(
          message || "Failed to create payment order. Please try again.",
        );
        return;
      }

      const rzpOrderId = order?.orderId;
      const rawEnvKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "";
      const cleanedEnvKey = rawEnvKey.replace(/['"]/g, "").trim();

      const rzpKey = order?.keyId || cleanedEnvKey;

      if (!rzpKey) {
        setIsProcessing(false);
        handleError("Razorpay key is missing. Please check configuration.");
        return;
      }

      const options = {
        key: rzpKey,
        amount: Number(order?.amount) || calculations.finalTotal * 100, // in paise
        currency: order?.currency || "INR",
        name: checkoutData.salon.name,
        description: `Appointment for ${checkoutData.services[0]?.name || "Salon Treatment"}`,
        image: "https://cdn-icons-png.flaticon.com/512/3256/3256191.png",
        order_id: rzpOrderId,
        prefill: {
          name: user?.name || checkoutData.customer.name,
          email: user?.email || checkoutData.customer.email,
          contact: user?.phone || checkoutData.customer.phone,
        },
        theme: {
          color: "#e11d48",
        },
        handler: async function (response: any) {
          // Step 3: Verify payment on backend
          try {
            if (response.razorpay_signature) {
              const verifyRes = await dispatch(
                verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId: booking._id,
                }),
              ).unwrap();

              if (verifyRes?.verified) {
                handleSuccess(
                  "Payment successful! Your appointment is confirmed.",
                );
                clearCheckoutStorage();
                bookingNavigation("success", booking);
              } else {
                setIsProcessing(false);
                handleError(
                  verifyRes?.message ||
                    "Payment verification failed. Please retry.",
                );
              }
            }
          } catch (verifyError: any) {
            setIsProcessing(false);
            const errText =
              typeof verifyError === "string"
                ? verifyError
                : verifyError?.response?.data?.message ||
                  verifyError?.message ||
                  "Payment verification failed. Please retry.";
            handleError(errText);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            handleError("Payment window closed.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setIsProcessing(false);
        handleError(
          response.error?.description ||
            "Razorpay payment failed. Please retry.",
        );
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      const errMsg =
        typeof err === "string"
          ? err
          : err?.response?.data?.message ||
            err?.message ||
            "Failed to initiate payment. Please retry.";
      handleError(errMsg);
    }
  };

  const clearCheckoutStorage = () => {
    sessionStorage.removeItem("glowbook_checkout");
    localStorage.removeItem("glowbook_checkout");
    localStorage.removeItem("glowbook_checkout_draft");
    localStorage.removeItem("glowbook_customer_bookings");
    if (user?.email) {
      localStorage.removeItem(`glowbook_customer_bookings_${user.email}`);
    }
  };

  const bookingNavigation = (
    status: "success" | "failure",
    booking: Booking | null,
  ) => {
    navigate(
      status === "success"
        ? `/booking-${status}/${booking?._id}`
        : `/booking-${status}`,
      {
        state: { booking: booking },
      },
    );
  };

  const saveBooking = async (bookingRecord: CreateBookingRequest) => {
    try {
      const res = await dispatch(createBooking(bookingRecord)).unwrap();
      if (!res?.booking || !res?.success) {
        const errorMsg =
          res?.message || "Booking creation failed. Please try again.";
        handleError(errorMsg);
        setIsProcessing(false);
        return null;
      }
      return res.booking;
    } catch (error: any) {
      setIsProcessing(false);
      handleError(error ?? "Booking Creation failed. Please try again.");
      return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-8 pb-24">
      {/* Top Header */}
      <div className="space-y-2 border-b border-(--line) pb-4">
        <Link
          to={`/salons/${checkoutData.salon.id}/book`}
          onClick={clearCheckoutStorage}
          className="inline-flex items-center gap-1 text-xs font-semibold text-(--muted) hover:text-(--ink) transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back to time selection</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-(--ink) tracking-tight">
          Checkout & Payment
        </h1>
      </div>

      {/* Guest Login Required Banner */}
      {!user && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold shrink-0">
              <User size={18} />
            </div>
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200 block text-sm">
                Sign in required to confirm your booking
              </span>
              <p className="text-amber-700 dark:text-amber-400">
                Log in to link this reservation to your account and track your
                appointments.
              </p>
            </div>
          </div>
          <Link
            to="/login"
            state={{ from: "/checkout" }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
          >
            <LogIn size={14} />
            <span>Log In / Sign Up</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Payment Methods & Promo (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Payment Method Selector */}
          <div className="p-6 sm:p-7 rounded-3xl bg-(--surface) border border-(--line) shadow-xs space-y-5">
            <div className="space-y-1 border-b border-(--line) pb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-(--ink)">
                  Step 4: Choose Payment Method
                </h2>
              </div>
              <p className="text-xs text-(--muted)">
                All online transactions are encrypted and secured via Razorpay.
              </p>
            </div>

            <div className="space-y-3">
              {/* Razorpay Option */}
              <div
                onClick={() => setPaymentMethod("razorpay")}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  paymentMethod === "razorpay"
                    ? "bg-(--rose)/5 border-(--rose) ring-1 ring-(--rose)"
                    : "bg-(--paper) border-(--line) hover:border-(--rose)/40"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="size-11 rounded-2xl bg-(--rose)/10 text-(--rose) flex items-center justify-center font-bold shrink-0">
                    <Zap size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-(--ink)">
                        Razorpay Quick Checkout
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        Instant
                      </span>
                    </div>
                    <p className="text-xs text-(--muted)">
                      UPI (Google Pay, PhonePe, Paytm), Credit / Debit Cards &
                      Net Banking
                    </p>
                  </div>
                </div>

                <div
                  className={`size-5 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    paymentMethod === "razorpay"
                      ? "bg-(--rose) text-white"
                      : "border border-(--line)"
                  }`}
                >
                  {paymentMethod === "razorpay" && (
                    <CheckCircle2 size={14} className="fill-current" />
                  )}
                </div>
              </div>

              {/* Pay at Salon Option */}
              <div
                onClick={() => setPaymentMethod("at_salon")}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  paymentMethod === "at_salon"
                    ? "bg-(--rose)/5 border-(--rose) ring-1 ring-(--rose)"
                    : "bg-(--paper) border-(--line) hover:border-(--rose)/40"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="size-11 rounded-2xl bg-(--soft) text-(--ink) flex items-center justify-center font-bold shrink-0">
                    <CreditCard size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-(--ink)">
                      Pay at Salon on Arrival
                    </h3>
                    <p className="text-xs text-(--muted)">
                      Pay directly with Cash or Card after completing your
                      appointment.
                    </p>
                  </div>
                </div>

                <div
                  className={`size-5 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    paymentMethod === "at_salon"
                      ? "bg-(--rose) text-white"
                      : "border border-(--line)"
                  }`}
                >
                  {paymentMethod === "at_salon" && (
                    <CheckCircle2 size={14} className="fill-current" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-(--muted) pt-2">
              <Lock size={14} className="text-emerald-500 shrink-0" />
              <span>256-bit SSL encrypted secure checkout</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Order Summary & Pay CTA (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-5">
          <div className="p-6 sm:p-7 rounded-3xl bg-(--surface) border border-(--line) shadow-xl space-y-5">
            <h2 className="text-base font-extrabold text-(--ink) border-b border-(--line) pb-3">
              Booking Confirmation Summary
            </h2>

            {/* Appointment Snapshot */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-(--ink) text-sm">
                {checkoutData.salon.name}
              </div>
              <p className="text-(--muted) flex items-center gap-1.5">
                <MapPin size={13} className="text-(--rose)" />
                <span className="truncate">{checkoutData.salon.address}</span>
              </p>
              <p className="text-(--muted) flex items-center gap-1.5">
                <Calendar size={13} className="text-(--rose)" />
                <span>
                  {checkoutData.appointment.date} at{" "}
                  {checkoutData.appointment.time}
                </span>
              </p>
              <p className="text-(--muted) flex items-center gap-1.5">
                <Clock size={13} className="text-(--rose)" />
                <span>
                  {checkoutData.appointment.durationMinutes} mins · Stylist:{" "}
                  <strong className="text-(--ink)">
                    {checkoutData.stylist.name}
                  </strong>
                </span>
              </p>
            </div>

            {/* Selected Items */}
            <div className="pt-3 border-t border-(--line) space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-(--muted) tracking-wider block mb-1">
                Treatments:
              </span>
              {checkoutData.services.map((srv: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-(--ink)"
                >
                  <span className="truncate max-w-44 font-medium">
                    {srv.name}
                  </span>
                  <span className="font-bold">{formatCurrency(srv.price)}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-(--line) space-y-2 text-xs">
              <div className="flex items-center justify-between text-(--muted)">
                <span>Subtotal</span>
                <span>{formatCurrency(calculations.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-(--muted)">
                <span>GST & Taxes (5%)</span>
                <span>{formatCurrency(calculations.tax)}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-extrabold text-(--ink) pt-2 border-t border-(--line)">
                <span>Total Due</span>
                <span className="text-(--rose)">
                  {formatCurrency(calculations.finalTotal)}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePayment}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-(--rose) text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-lg cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Connecting to Razorpay...</span>
                </>
              ) : !user ? (
                <>
                  <LogIn size={18} />
                  <span>Sign In to Confirm & Pay</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>
                    {paymentMethod === "razorpay"
                      ? `Pay ${formatCurrency(calculations.finalTotal)} via Razorpay`
                      : `Confirm & Pay at Salon`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
