import React, { useState, useEffect } from "react";
import { X, Save, Users, Loader } from "lucide-react";
import TextField from "@/components/common/TextField";
import type {
  StaffActionRequest,
  StaffMember,
  StaffRole,
} from "@/redux/features/staff/staff.types";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/redux.hooks";
import { fetchServicesBySalon } from "@/redux/features/services/services.slice";
import { handleError } from "@/utils/handleResponse";

const ROLES: StaffRole[] = [
  "Senior Stylist",
  "Hair Specialist",
  "Color Master",
  "Skin & Spa Therapist",
  "Barber & Groomer",
  "Makeup Artist",
];

export interface StaffFormModalProps {
  isOpen: boolean;
  staff: StaffMember | null;
  onClose: () => void;
  onSave: (staff: StaffActionRequest) => void;
  onUpdate: (staff: StaffMember) => void;
}

const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  staff,
  onClose,
  onSave,
  onUpdate,
}) => {
  const { error, isLoading, isServicesFetched, services } = useAppSelector(
    (state) => state.services,
  );
  const { salon } = useAppSelector((state) => state.salon);
  const dispatch = useAppDispatch();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<StaffRole>("Senior Stylist");
  const [assignedServices, setAssignedServices] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});

  useEffect(() => {
    async function loadServices() {
      if (!salon) return handleError("Bad Request!");
      if (isServicesFetched) return;
      await dispatch(fetchServicesBySalon({ salonId: salon._id }));
    }
    loadServices();
  }, [dispatch]);

  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setEmail(staff.email);
      setPhone(staff.phone);
      setRole(staff.role);
      setAssignedServices(staff.assignedServices || []);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setRole("Senior Stylist");
      setAssignedServices([]);
    }
    setErrors({});
  }, [staff, isOpen]);

  if (!isOpen) return null;

  const handleToggleService = (serviceName: string) => {
    setAssignedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; phone?: string } = {};

    if (!name.trim()) newErrors.name = "Staff name is required";
    if (!email.trim() || !email.includes("@"))
      newErrors.email = "Valid email is required";
    if (!phone.trim() || phone.replace(/\D/g, "").length !== 10)
      newErrors.phone = "Valid 10-digit phone number is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (staff) {
      onUpdate({
        _id: staff._id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.replace(/\D/g, "").slice(0, 10),
        role,
        assignedServices,
      });
    } else {
      onSave({
        name: name.trim(),
        email: email.trim(),
        phone: phone.replace(/\D/g, "").slice(0, 10),
        role,
        assignedServices,
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-(--surface) text-(--ink) border border-(--line) rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--line) pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-(--rose)/10 text-(--rose) flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-(--ink)">
                {staff ? "Edit Stylist / Staff" : "Add New Staff"}
              </h2>
              <p className="text-xs text-(--muted)">
                {staff
                  ? "Update team member details & assignments"
                  : "Add a new stylist to your salon roster"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--soft) flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            name="name"
            label="Full Name"
            placeholder="e.g. Arjun Verma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              name="phone"
              label="Phone Number"
              type="tel"
              maxLength={10}
              placeholder="10-digit number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              error={errors.phone}
              required
            />
            <TextField
              name="email"
              label="Email Address"
              type="email"
              placeholder="staff@salon.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="role" className="text-xs font-bold text-(--ink)">
                Primary Role / Title <span className="text-(--rose)">*</span>
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full appearance-none rounded-lg border border-(--line) bg-(--surface) px-3.5 py-3 text-sm text-(--ink) outline-none transition cursor-pointer"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assigned Services Multi-select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-(--ink)">
              Assigned Services ({assignedServices.length} selected)
            </label>
            <p className="text-[11px] text-(--muted)">
              Select all treatments and services this stylist is certified to
              perform:
            </p>
            <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-(--paper) border border-(--line) text-xs">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader />
                </div>
              ) : error ? (
                <p className="text-(--rose)">Error fetching services</p>
              ) : (
                services.map((srv) => {
                  const isSelected = assignedServices.includes(srv.name);
                  return (
                    <label
                      key={srv._id}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-(--soft) cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleService(srv.name)}
                        className="size-4 accent-(--rose) rounded cursor-pointer"
                      />
                      <span className="font-medium text-(--ink)">
                        {srv.name}
                      </span>
                      <span className="text-[10px] text-(--muted) ml-auto">
                        ({srv.category})
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-(--line) pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-(--line) bg-(--soft) hover:bg-(--line)/40 text-xs font-semibold text-(--ink) transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--rose) text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
            >
              <Save size={15} />
              <span>{staff ? "Save Changes" : "Add Stylist"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFormModal;
