import React, { useState, useRef, useMemo } from "react";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle2,
  Plus,
  X,
  Save,
  Building,
  AlertCircle,
  Camera,
  Upload,
  Image,
} from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import TextField from "@/components/common/TextField";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import { updateSalon, deleteSalon } from "@/redux/features/salon/salon.slice";
import type {
  Salon,
  DaySchedule,
  DayOfWeek,
  UpdateSalonRequest,
} from "@/redux/features/salon/salon.types";
import { DAYS_OF_WEEK } from "@/redux/features/salon/salon.types";
import { handleSuccess, handleError } from "@/utils/handleResponse";
import SalonCreationForm from "@/components/salon/SalonCreationForm";
import { TIME_OPTIONS } from "@/components/salon";
import { getTodaySchedule, formatWeeklySchedule } from "@/utils/bookingUtils";

const SalonProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { salon } = useAppSelector((state) => state.salon);

  // Local state synced with actual Redux salon
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Salon>>({});
  const [newAmenity, setNewAmenity] = useState<string>("");

  const todaySchedule = useMemo(
    () => getTodaySchedule(salon?.businessHours),
    [salon?.businessHours],
  );
  const weeklySchedule = useMemo(
    () => formatWeeklySchedule(salon?.businessHours),
    [salon?.businessHours],
  );

  // If no salon exists in the backend for this owner, render the Salon Creation Form
  if (!salon) {
    return <SalonCreationForm />;
  }

  // Handle Edit Modal Open
  const handleOpenEditModal = () => {
    if (!salon) return;

    setEditForm({
      _id: salon._id,
      name: salon.name || "",
      phone: salon.phone || "",
      email: salon.email || "",
      description: salon.description || "",
      addressLine1: salon.addressLine1 || "",
      addressLine2: salon.addressLine2 || "",
      city: salon.city || "",
      state: salon.state || "",
      country: salon.country || "India",
      postalCode: salon.postalCode || "",
      businessHours: salon.businessHours,
      amenities: salon.amenities || [],
      coverUrl: salon.coverUrl || "",
    });
    setSaveSuccessMessage("");
    setIsEditModalOpen(true);
  };

  // Business Hours Update Helpers
  const handleUpdateDay = (
    dayKey: DayOfWeek,
    field: keyof DaySchedule,
    value: any,
  ) => {
    setEditForm((prev) => {
      const currentHours = prev.businessHours || salon?.businessHours || {};
      const daySchedule = currentHours[dayKey] || {
        isOpen: false,
        openingTime: null,
        closingTime: null,
      };

      const updatedDay: DaySchedule = {
        ...daySchedule,
        [field]: value,
      };

      return {
        ...prev,
        businessHours: {
          ...currentHours,
          [dayKey]: updatedDay,
        },
      };
    });
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith("image/")) {
      return handleError(
        "Please select a valid image file (PNG, JPG, JPEG, WEBP)",
      );
    }

    // Validate size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      return handleError("Image size should be less than 4MB");
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setEditForm((prev) => ({
        ...prev,
        coverUrl: base64String,
      }));
      handleSuccess("Photo selected! Click 'Save Changes' to update.");
    };
    reader.onerror = () => {
      handleError("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  // Handle Remove Photo
  const handleRemovePhoto = () => {
    setEditForm((prev) => ({
      ...prev,
      coverUrl: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle Save Edits with API Integration
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editForm.name?.trim()) {
      return handleError("Salon name is required");
    }
    if (!editForm.phone?.trim() || editForm.phone.length !== 10) {
      return handleError("Please enter a valid 10-digit phone number");
    }
    if (!editForm.email?.trim()) {
      return handleError("Email address is required");
    }
    if (!editForm.addressLine1?.trim()) {
      return handleError("Address Line 1 is required");
    }
    if (!editForm.city?.trim()) {
      return handleError("City is required");
    }
    if (!editForm.state?.trim()) {
      return handleError("State is required");
    }
    if (!editForm.postalCode?.trim()) {
      return handleError("Postal code is required");
    }

    try {
      setIsUpdating(true);
      const payload: UpdateSalonRequest = {
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
        description: editForm.description,
        addressLine1: editForm.addressLine1,
        addressLine2: editForm.addressLine2,
        city: editForm.city,
        state: editForm.state,
        country: editForm.country,
        postalCode: editForm.postalCode,
        businessHours: editForm.businessHours,
        amenities: editForm.amenities || [],
        coverUrl: editForm.coverUrl,
      };

      const result = await dispatch(
        updateSalon({
          request: payload,
          salonId: salon._id,
        }),
      ).unwrap();

      handleSuccess(result?.message || "Salon profile updated successfully!");
      setIsEditModalOpen(false);
    } catch (error: any) {
      handleError(error || "Failed to update salon profile");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Add Amenity
  const handleAddAmenity = () => {
    const trimmed = newAmenity.trim();
    if (trimmed && !(editForm.amenities || []).includes(trimmed)) {
      setEditForm((prev) => ({
        ...prev,
        amenities: [...(prev.amenities || []), trimmed],
      }));
      setNewAmenity("");
    }
  };

  // Handle Remove Amenity
  const handleRemoveAmenity = (amenityToRemove: string) => {
    setEditForm((prev) => ({
      ...prev,
      amenities: (prev.amenities || []).filter((a) => a !== amenityToRemove),
    }));
  };

  // Handle Permanent Delete with API Integration
  const handleDeletePermanently = async () => {
    try {
      setIsDeleting(true);
      const result = await dispatch(deleteSalon(salon._id)).unwrap();
      handleSuccess(result?.message || "Salon deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      handleError(error || "Failed to delete salon");
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine missing optional fields for the profile completion alert
  const hasBusinessHours = Boolean(
    salon.businessHours &&
    Object.values(salon.businessHours).some((day) => day?.isOpen),
  );
  const hasAmenities = Boolean(salon.amenities && salon.amenities.length > 0);
  const isProfileIncomplete = !hasBusinessHours || !hasAmenities;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6 sm:space-y-8">
      {/* ========================================================================= */}
      {/* 1. HEADER SECTION                                                         */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeading
          title="Salon Profile"
          description="View, edit, and manage your salon business information."
        />
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleOpenEditModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--rose) text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
          >
            <Edit3 size={16} />
            <span>Edit Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
            <span>Delete Salon</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PROFILE COMPLETION ALERT BANNER (Shown if details missing)              */}
      {/* ========================================================================= */}
      {isProfileIncomplete && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-(--ink)">
                Complete your salon profile
              </h3>
              <p className="text-xs text-(--muted) mt-0.5 max-w-xl">
                {!hasBusinessHours && !hasAmenities
                  ? "Weekly business hours and salon amenities are not yet configured. Complete them to help guests book appointments."
                  : !hasBusinessHours
                    ? "Weekly business hours are not set. Configure your operating schedule."
                    : "Add amenities (e.g. AC, Wi-Fi, Parking) to make your profile stand out."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenEditModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            <Plus size={15} />
            <span>Complete Profile</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SALON HERO BANNER                                                      */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-(--surface) border border-(--line) shadow-xs relative overflow-hidden">
        <div
          className="absolute -top-12 -right-12 size-48 bg-(--rose)/5 rounded-full blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
          {/* Avatar / Cover Photo Badge */}
          <div className="relative size-24 sm:size-28 rounded-3xl overflow-hidden bg-(--soft) border-2 border-(--line) text-(--rose) flex items-center justify-center shrink-0 shadow-md group">
            {salon.coverUrl ? (
              <img
                src={salon.coverUrl}
                alt={salon.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-(--rose)/5 text-(--rose)">
                <Store size={38} />
                <span className="text-[10px] font-bold mt-1 text-(--muted)">
                  No Photo
                </span>
              </div>
            )}
            {/* Quick Change Overlay */}
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer backdrop-blur-2xs"
            >
              <Camera size={18} />
              <span>Change</span>
            </button>
          </div>

          {/* Title & Metadata */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-bold text-(--ink) tracking-tight">
                {salon.name}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-(--muted) font-medium">
              {salon.city}
              {salon.state ? `, ${salon.state}` : ""}
            </p>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-(--line) text-xs">
          <div className="flex items-center gap-2.5 text-(--muted) p-2.5 rounded-xl bg-(--paper) border border-(--line)">
            <Phone size={16} className="text-(--rose) shrink-0" />
            <span className="font-semibold text-(--ink) truncate">
              +91 {salon.phone}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-(--muted) p-2.5 rounded-xl bg-(--paper) border border-(--line)">
            <Mail size={16} className="text-(--rose) shrink-0" />
            <span className="font-semibold text-(--ink) truncate">
              {salon.email}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-(--muted) p-2.5 rounded-xl bg-(--paper) border border-(--line)">
            <Clock
              size={16}
              className={
                todaySchedule.isOpen
                  ? "text-(--rose)"
                  : "text-amber-500 shrink-0"
              }
            />
            <span className="font-semibold text-(--ink) truncate">
              {todaySchedule.isOpen
                ? `Today: ${todaySchedule.text}`
                : "Closed Today"}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-(--muted) p-2.5 rounded-xl bg-(--paper) border border-(--line)">
            <Calendar size={16} className="text-(--rose) shrink-0" />
            <span className="font-semibold text-(--ink) truncate">
              {hasBusinessHours
                ? "Weekly Schedule Active"
                : "Schedule not configured"}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DETAILED INFORMATION SECTIONS                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Details & Location (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* About & Description Card */}
          <div className="p-6 rounded-3xl bg-(--surface) border border-(--line) space-y-4">
            <h3 className="text-base font-bold text-(--ink) flex items-center gap-2">
              <Sparkles size={18} className="text-(--rose)" />
              <span>About the Salon</span>
            </h3>
            <p className="text-sm text-(--muted) leading-relaxed">
              {salon.description ||
                "No description provided yet. Click 'Edit Profile' to add a detailed description for your customers."}
            </p>
          </div>

          {/* Location & Address Card */}
          <div className="p-6 rounded-3xl bg-(--surface) border border-(--line) space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-(--ink) flex items-center gap-2">
                <MapPin size={18} className="text-(--rose)" />
                <span>Location & Address</span>
              </h3>
              {salon.postalCode && (
                <span className="text-xs font-mono text-(--muted) bg-(--soft) px-2.5 py-1 rounded-md">
                  PIN: {salon.postalCode}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-(--paper) border border-(--line) space-y-1">
                <span className="text-(--muted) font-semibold uppercase tracking-wider text-[11px]">
                  Street Address
                </span>
                <p className="text-sm font-bold text-(--ink)">
                  {salon.addressLine1 || "Not specified"}
                </p>
                {salon.addressLine2 && (
                  <p className="text-xs text-(--muted)">{salon.addressLine2}</p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-(--paper) border border-(--line) space-y-1">
                <span className="text-(--muted) font-semibold uppercase tracking-wider text-[11px]">
                  City & State
                </span>
                <p className="text-sm font-bold text-(--ink)">{salon.city}</p>
                <p className="text-xs text-(--muted)">
                  {salon.state || "Not specified"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-(--paper) border border-(--line) space-y-1">
                <span className="text-(--muted) font-semibold uppercase tracking-wider text-[11px]">
                  Country
                </span>
                <p className="text-sm font-bold text-(--ink)">
                  {salon.country || "India"}
                </p>
                <p className="text-xs text-(--muted)">
                  Postal Code: {salon.postalCode || "N/A"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-(--paper) border border-(--line) space-y-1">
                <span className="text-(--muted) font-semibold uppercase tracking-wider text-[11px]">
                  Contact Phone & Email
                </span>
                <p className="text-sm font-bold text-(--ink)">
                  +91 {salon.phone}
                </p>
                <p className="text-xs text-(--muted)">{salon.email}</p>
              </div>
            </div>
          </div>

          {/* Weekly Business Hours Card */}
          <div className="p-6 rounded-3xl bg-(--surface) border border-(--line) space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-(--ink) flex items-center gap-2">
                <Clock size={18} className="text-(--rose)" />
                <span>Weekly Business Hours</span>
              </h3>
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="text-xs font-semibold text-(--rose) hover:underline cursor-pointer"
              >
                + Edit Hours
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {weeklySchedule.map((day) => (
                <div
                  key={day.key}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    day.isToday
                      ? "bg-(--rose)/5 border-(--rose)/30 shadow-2xs"
                      : "bg-(--paper) border-(--line)"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-(--ink)">
                      <span>{day.label}</span>
                      {day.isToday && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-(--rose) text-white font-bold">
                          Today
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        day.isOpen
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {day.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                  <p
                    className={
                      day.isOpen
                        ? "text-xs font-semibold text-(--ink)"
                        : "text-xs text-(--muted) italic"
                    }
                  >
                    {day.timeText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Amenities & Danger Zone (1 Col) */}
        <div className="space-y-6">
          {/* Amenities & Facilities Card */}
          <div className="p-6 rounded-3xl bg-(--surface) border border-(--line) space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-(--ink) flex items-center gap-2">
                <Building size={18} className="text-(--rose)" />
                <span>Amenities & Facilities</span>
              </h3>
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="text-xs font-semibold text-(--rose) hover:underline cursor-pointer"
              >
                + Manage
              </button>
            </div>

            {salon.amenities && salon.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {salon.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-(--soft) text-(--ink) border border-(--line)"
                  >
                    <CheckCircle2 size={13} className="text-(--rose)" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-(--line) rounded-2xl p-4 space-y-2">
                <p className="text-xs text-(--muted)">
                  No amenities added to your salon profile yet.
                </p>
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-(--soft) hover:bg-(--line)/40 text-xs font-semibold text-(--ink) transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Amenities</span>
                </button>
              </div>
            )}
          </div>

          {/* Danger Zone Card */}
          <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 space-y-3">
            <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <Trash2 size={18} />
              <span>Danger Zone</span>
            </h3>
            <p className="text-xs text-(--muted) leading-relaxed">
              Permanently delete this salon, along with all associated services,
              staff assignments, and client appointments.
            </p>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <Trash2 size={15} />
              <span>Delete Salon Permanently</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. EDIT SALON PROFILE MODAL                                               */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-salon-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            onClick={() => setIsEditModalOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative bg-(--surface) text-(--ink) border border-(--line) rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-6 z-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-(--line) pb-4">
              <div>
                <h2
                  id="edit-salon-title"
                  className="text-xl font-bold text-(--ink)"
                >
                  Edit Salon Profile
                </h2>
                <p className="text-xs text-(--muted) mt-0.5">
                  Update your salon details, location, and operating schedule.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="size-8 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--soft) flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Success Message Banner */}
            {saveSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Salon Profile Photo Uploader */}
              <div className="space-y-3 p-4 rounded-2xl bg-(--paper) border border-(--line)">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image size={16} className="text-(--rose)" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-(--ink)">
                      Salon Profile & Cover Photo
                    </h4>
                  </div>
                  {editForm.coverUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview */}
                  <div className="size-20 sm:size-24 rounded-2xl overflow-hidden bg-(--surface) border-2 border-dashed border-(--line) shrink-0 flex items-center justify-center relative">
                    {editForm.coverUrl ? (
                      <img
                        src={editForm.coverUrl}
                        alt="Salon preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2 text-(--muted)">
                        <Store
                          size={26}
                          className="mx-auto text-(--rose)/60 mb-1"
                        />
                        <span className="text-[10px] block leading-tight">
                          No Image
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-(--surface) border border-(--line) hover:border-(--rose) text-xs font-bold text-(--ink) transition-colors cursor-pointer shadow-2xs"
                      >
                        <Upload size={14} className="text-(--rose)" />
                        <span>
                          {editForm.coverUrl ? "Change Photo" : "Upload Photo"}
                        </span>
                      </button>
                    </div>

                    <p className="text-[11px] text-(--muted)">
                      Supported formats: PNG, JPG, JPEG, WEBP (Max 4MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-(--muted)">
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    name="name"
                    label="Salon Name"
                    value={editForm.name || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    required
                  />
                  <TextField
                    name="phone"
                    label="Phone Number"
                    type="tel"
                    maxLength={10}
                    value={editForm.phone || ""}
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setEditForm({ ...editForm, phone: val });
                    }}
                    required
                  />
                  <TextField
                    name="email"
                    label="Email Address"
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <TextField
                  name="description"
                  label="Description"
                  multiline
                  rows={3}
                  placeholder="Tell customers about your salon services..."
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>

              {/* Location & Address */}
              <div className="space-y-4 border-t border-(--line) pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-(--muted)">
                  Address & Location
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    name="addressLine1"
                    label="Address Line 1"
                    value={editForm.addressLine1 || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, addressLine1: e.target.value })
                    }
                    required
                  />
                  <TextField
                    name="addressLine2"
                    label="Address Line 2 (Optional)"
                    value={editForm.addressLine2 || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, addressLine2: e.target.value })
                    }
                  />
                  <TextField
                    name="city"
                    label="City"
                    value={editForm.city || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, city: e.target.value })
                    }
                    required
                  />
                  <TextField
                    name="state"
                    label="State"
                    value={editForm.state || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, state: e.target.value })
                    }
                    required
                  />
                  <TextField
                    name="country"
                    label="Country"
                    value={editForm.country || "India"}
                    onChange={(e) =>
                      setEditForm({ ...editForm, country: e.target.value })
                    }
                    required
                  />
                  <TextField
                    name="postalCode"
                    label="Postal Code"
                    value={editForm.postalCode || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, postalCode: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Operating Schedule / Business Hours */}
              <div className="space-y-4 border-t border-(--line) pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-(--muted)">
                      Weekly Business Hours
                    </h4>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {DAYS_OF_WEEK.map(({ key, label }) => {
                    const currentSchedule = editForm.businessHours?.[key];
                    const isOpen = Boolean(currentSchedule?.isOpen);

                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isOpen
                            ? "bg-(--paper) border-(--line)"
                            : "bg-(--soft)/50 border-(--line)/60 opacity-80"
                        }`}
                      >
                        {/* Left: Day Label & Toggle */}
                        <div className="flex items-center gap-3 min-w-35">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateDay(key, "isOpen", !isOpen)
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isOpen
                                ? "bg-(--rose)"
                                : "bg-gray-300 dark:bg-gray-700"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isOpen ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <div>
                            <span className="text-sm font-bold text-(--ink) block">
                              {label}
                            </span>
                            <span
                              className={`text-[11px] font-semibold ${
                                isOpen ? "text-emerald-600" : "text-gray-400"
                              }`}
                            >
                              {isOpen ? "Open" : "Closed"}
                            </span>
                          </div>
                        </div>

                        {/* Right: Time Selectors or Closed Label */}
                        {isOpen ? (
                          <div className="flex items-center gap-2 flex-1 max-w-md">
                            <div className="relative flex-1">
                              <select
                                value={currentSchedule?.openingTime || ""}
                                onChange={(e) =>
                                  handleUpdateDay(
                                    key,
                                    "openingTime",
                                    e.target.value || null,
                                  )
                                }
                                className="w-full appearance-none rounded-lg border border-(--line) bg-(--surface) px-2.5 py-1.5 pr-8 text-xs text-(--ink) outline-none transition cursor-pointer"
                              >
                                <option value="">Select Opening Time</option>
                                {TIME_OPTIONS.map((time) => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-(--muted)">
                                <Clock size={12} />
                              </div>
                            </div>

                            <span className="text-xs text-(--muted) font-medium">
                              to
                            </span>

                            <div className="relative flex-1">
                              <select
                                value={currentSchedule?.closingTime || ""}
                                onChange={(e) =>
                                  handleUpdateDay(
                                    key,
                                    "closingTime",
                                    e.target.value || null,
                                  )
                                }
                                className="w-full appearance-none rounded-lg border border-(--line) bg-(--surface) px-2.5 py-1.5 pr-8 text-xs text-(--ink) outline-none transition cursor-pointer"
                              >
                                <option value="">Select Closing Time</option>
                                {TIME_OPTIONS.map((time) => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-(--muted)">
                                <Clock size={12} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-(--muted) italic">
                            Salon is closed on this day
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Amenities Management */}
              <div className="space-y-3 border-t border-(--line) pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-(--muted)">
                  Amenities & Facilities (Optional)
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="Add facility (e.g. Air Conditioned, Free Wi-Fi, Card Payments)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-(--paper) border border-(--line) text-sm text-(--ink) focus:outline-none focus:ring-2 focus:ring-(--rose)"
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="px-4 py-2.5 rounded-xl bg-(--soft) hover:bg-(--line)/40 text-xs font-semibold text-(--ink) border border-(--line) transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(editForm.amenities || []).map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-(--soft) text-(--ink) border border-(--line)"
                    >
                      <span>{amenity}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(amenity)}
                        className="text-(--muted) hover:text-rose-600 transition-colors"
                        aria-label={`Remove ${amenity}`}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="border-t border-(--line) pt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-(--line) bg-(--soft) hover:bg-(--line)/40 text-xs font-semibold text-(--ink) transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--rose) text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <div className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DELETE CONFIRMATION MODAL (Reusing ConfirmationModal)                  */}
      {/* ========================================================================= */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Salon Permanently?"
        description={
          <span>
            Are you sure you want to permanently delete{" "}
            <strong className="text-(--ink)">{salon.name}</strong>? All
            associated services, staff accounts, client appointments, and
            reviews will be permanently removed. This action cannot be undone.
          </span>
        }
        confirmText="Delete Salon Permanently"
        cancelText="Keep Salon"
        variant="danger"
        isLoading={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePermanently}
      />
    </div>
  );
};

export default SalonProfile;
