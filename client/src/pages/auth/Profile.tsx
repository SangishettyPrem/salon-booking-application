import React, { useState } from "react";
import { useFormik } from "formik";
import {
  Edit3,
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  Trash2,
} from "lucide-react";
import {
  UpdateProfile,
  ChangePassword,
  DeleteAccount,
} from "@/redux/features/auth/auth.slice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import { handleError, handleSuccess } from "@/utils/handleResponse";
import {
  ProfileValidationSchema,
  ChangePasswordValidationSchema,
} from "@/validations/auth.validations";
import ConfirmationModal from "@/components/common/ConfirmationModal";

const Profile: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Profile editing state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);

  // Password changing state
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<{
    current: boolean;
    new: boolean;
    confirm: boolean;
  }>({
    current: false,
    new: false,
    confirm: false,
  });

  // Delete account state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Profile Formik Form
  const profileFormik = useFormik({
    initialValues: {
      _id: user?._id || "",
      name: user?.name || "",
      phone: user?.phone || "",
    },
    enableReinitialize: true,
    validationSchema: ProfileValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsUpdatingProfile(true);
        const result = await dispatch(UpdateProfile(values)).unwrap();
        if (!result.success) {
          return handleError(result.message ?? "Failed to update profile.");
        }
        setIsEditing(false);
        return handleSuccess(result.message ?? "Profile updated successfully.");
      } catch (error: any) {
        return handleError(error ?? "Failed to update profile.");
      } finally {
        setIsUpdatingProfile(false);
      }
    },
  });

  // Change Password Formik Form
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: ChangePasswordValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setIsUpdatingPassword(true);
        const result = await dispatch(ChangePassword(values)).unwrap();
        if (!result.success) {
          return handleError(result.message ?? "Failed to change password.");
        }
        resetForm();
        return handleSuccess(
          result.message ?? "Password changed successfully.",
        );
      } catch (error: any) {
        return handleError(error ?? "Failed to change password.");
      } finally {
        setIsUpdatingPassword(false);
      }
    },
  });

  // Handle Delete Account Action
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const result = await dispatch(DeleteAccount()).unwrap();
      if (result.success) {
        handleSuccess(result.message ?? "Account deleted successfully.");
        await new Promise((resolve) => setTimeout(resolve, 800));
        window.location.href = "/";
      } else {
        handleError(result.message ?? "Failed to delete account.");
      }
    } catch (error: any) {
      handleError(error ?? "Failed to delete account.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-10 space-y-8">
      {/* 1. Header Section */}
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-(--rose)">
          Account Settings
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-(--ink) tracking-tight">
          Hi, {user.name.split(" ")[0]}.
        </h1>
        <p className="text-xs sm:text-sm text-(--muted)">
          Manage your personal profile details and account security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* 2. Personal Information Section (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-(--surface) border border-(--line) shadow-xs space-y-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div
              className="absolute -top-12 -right-12 w-36 h-36 bg-(--rose)/5 rounded-full blur-2xl pointer-events-none"
              aria-hidden="true"
            />

            {/* Profile Header with Avatar & Badge */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="size-14 sm:size-16 rounded-2xl bg-(--rose) text-white font-bold text-xl sm:text-2xl flex items-center justify-center shadow-md uppercase">
                  {user.name.slice(0, 1)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-(--ink) truncate max-w-42">
                    {user.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-(--muted) capitalize">
                    Role: <strong className="text-(--ink)">{user.role}</strong>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isEditing) profileFormik.resetForm();
                  setIsEditing(!isEditing);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isEditing
                    ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                    : "bg-(--soft) hover:bg-(--line)/60 text-(--ink)"
                }`}
              >
                {isEditing ? (
                  <>
                    <X size={14} />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </>
                )}
              </button>
            </div>

            {/* Details or Edit Form */}
            {isEditing ? (
              <form
                onSubmit={profileFormik.handleSubmit}
                className="space-y-4 pt-2"
              >
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="block text-xs font-bold text-(--ink)"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={profileFormik.values.name}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      placeholder="Your full name"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border bg-(--paper) text-xs font-semibold text-(--ink) outline-none transition focus:ring-2 focus:ring-(--rose)/30 ${
                        profileFormik.touched.name && profileFormik.errors.name
                          ? "border-rose-500"
                          : "border-(--line)"
                      }`}
                    />
                    <UserIcon
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)"
                    />
                  </div>
                  {profileFormik.touched.name && profileFormik.errors.name && (
                    <p className="text-[11px] text-rose-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{profileFormik.errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="phone"
                    className="block text-xs font-bold text-(--ink)"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      maxLength={10}
                      value={profileFormik.values.phone}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      placeholder="10-digit phone number"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border bg-(--paper) text-xs font-semibold text-(--ink) outline-none transition focus:ring-2 focus:ring-(--rose)/30 ${
                        profileFormik.touched.phone &&
                        profileFormik.errors.phone
                          ? "border-rose-500"
                          : "border-(--line)"
                      }`}
                    />
                    <Phone
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)"
                    />
                  </div>
                  {profileFormik.touched.phone &&
                    profileFormik.errors.phone && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>{profileFormik.errors.phone}</span>
                      </p>
                    )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-(--rose) hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Save size={14} />
                    <span>
                      {isUpdatingProfile ? "Saving..." : "Save Changes"}
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-2xl bg-(--paper) border border-(--line) flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-(--soft) flex items-center justify-center text-(--rose)">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-(--muted)">
                      Email Address
                    </p>
                    <p className="text-xs font-bold text-(--ink) truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-(--paper) border border-(--line) flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-(--soft) flex items-center justify-center text-(--rose)">
                    <Phone size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-(--muted)">
                      Phone Number
                    </p>
                    <p className="text-xs font-bold text-(--ink)">
                      {user.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Change Password Section (7 Columns) */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-(--surface) border border-(--line) shadow-xs space-y-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-3.5 pb-4 border-b border-(--line)">
              <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <KeyRound size={20} />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-(--ink)">
                  Change Password
                </h2>
                <p className="text-xs text-(--muted)">
                  Ensure your account is using a long, random password to stay
                  secure.
                </p>
              </div>
            </div>

            {/* Change Password Form */}
            <form
              onSubmit={passwordFormik.handleSubmit}
              className="space-y-4 sm:space-y-5"
            >
              {/* Current Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="currentPassword"
                  className="block text-xs font-bold text-(--ink)"
                >
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPassword.current ? "text" : "password"}
                    value={passwordFormik.values.currentPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    placeholder="Enter current password"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border bg-(--paper) text-xs font-medium text-(--ink) outline-none transition focus:ring-2 focus:ring-(--rose)/30 ${
                      passwordFormik.touched.currentPassword &&
                      passwordFormik.errors.currentPassword
                        ? "border-rose-500"
                        : "border-(--line)"
                    }`}
                  />
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted) hover:text-(--ink) transition cursor-pointer"
                  >
                    {showPassword.current ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                </div>
                {passwordFormik.touched.currentPassword &&
                  passwordFormik.errors.currentPassword && (
                    <p className="text-[11px] text-rose-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{passwordFormik.errors.currentPassword}</span>
                    </p>
                  )}
              </div>

              {/* New Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-bold text-(--ink)"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword.new ? "text" : "password"}
                      value={passwordFormik.values.newPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      placeholder="At least 6 characters"
                      className={`w-full pl-9 pr-10 py-2.5 rounded-xl border bg-(--paper) text-xs font-medium text-(--ink) outline-none transition focus:ring-2 focus:ring-(--rose)/30 ${
                        passwordFormik.touched.newPassword &&
                        passwordFormik.errors.newPassword
                          ? "border-rose-500"
                          : "border-(--line)"
                      }`}
                    />
                    <KeyRound
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted) hover:text-(--ink) transition cursor-pointer"
                    >
                      {showPassword.new ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>
                  </div>
                  {passwordFormik.touched.newPassword &&
                    passwordFormik.errors.newPassword && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>{passwordFormik.errors.newPassword}</span>
                      </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-bold text-(--ink)"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordFormik.values.confirmPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      placeholder="Repeat new password"
                      className={`w-full pl-9 pr-10 py-2.5 rounded-xl border bg-(--paper) text-xs font-medium text-(--ink) outline-none transition focus:ring-2 focus:ring-(--rose)/30 ${
                        passwordFormik.touched.confirmPassword &&
                        passwordFormik.errors.confirmPassword
                          ? "border-rose-500"
                          : "border-(--line)"
                      }`}
                    />
                    <ShieldCheck
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted) hover:text-(--ink) transition cursor-pointer"
                    >
                      {showPassword.confirm ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>
                  </div>
                  {passwordFormik.touched.confirmPassword &&
                    passwordFormik.errors.confirmPassword && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>{passwordFormik.errors.confirmPassword}</span>
                      </p>
                    )}
                </div>
              </div>

              {/* Password Requirement Hint */}
              <div className="p-3 rounded-2xl bg-(--soft) border border-(--line) flex items-center gap-2 text-[11px] text-(--muted)">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>
                  New password must be at least 6 characters and match
                  confirmation.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-(--rose) hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-(--rose)/40"
                >
                  <Lock size={14} />
                  <span>
                    {isUpdatingPassword
                      ? "Updating Password..."
                      : "Update Password"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 4. Danger Zone: Delete Account */}
      <div className="p-6 sm:p-7 rounded-3xl bg-rose-500/5 border border-rose-500/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="size-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
            <Trash2 size={20} />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-rose-700 dark:text-rose-400">
              Delete Account
            </h3>
            <p className="text-xs text-(--muted) max-w-xl">
              Permanently delete your profile, appointments, and all associated
              personal data. This action is irreversible.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
        >
          <Trash2 size={14} />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
        variant="danger"
        title="Delete Your Account?"
        confirmText="Yes, Delete My Account"
        cancelText="Keep Account"
        description="Are you sure you want to permanently delete your account? All of your personal details, bookings, and salon associations will be removed permanently. This cannot be undone."
      />
    </div>
  );
};

export default Profile;
