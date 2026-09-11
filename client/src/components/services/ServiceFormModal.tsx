import React, { useState, useEffect } from "react";
import { X, Save, Scissors } from "lucide-react";
import TextField from "@/components/common/TextField";
import type {
  Service,
  ServiceCategory,
} from "@/redux/features/services/services.types";

const CATEGORIES: ServiceCategory[] = [
  "Haircut & Styling",
  "Beard & Grooming",
  "Skin & Facials",
  "Spa & Massage",
  "Bridal & Makeover",
  "Hair Color & Highlights",
];

export interface ServiceFormModalProps {
  isOpen: boolean;
  service: Service | null; // null for Create, populated for Edit
  onClose: () => void;
  onSave: (service: Service) => void;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  service,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState<string>("");
  const [category, setCategory] =
    useState<ServiceCategory>("Haircut & Styling");
  const [price, setPrice] = useState<number | string>("");
  const [durationMinutes, setDurationMinutes] = useState<number | string>(30);
  const [description, setDescription] = useState<string>("");
  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    duration?: string;
  }>({});

  useEffect(() => {
    if (service) {
      setName(service.name);
      setCategory(service.category);
      setPrice(service.price);
      setDurationMinutes(service.durationMinutes);
      setDescription(service.description);
    } else {
      setName("");
      setCategory("Haircut & Styling");
      setPrice("");
      setDurationMinutes(30);
      setDescription("");
    }
    setErrors({});
  }, [service, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; price?: string; duration?: string } = {};

    if (!name.trim()) newErrors.name = "Service name is required";
    if (!price || Number(price) <= 0)
      newErrors.price = "Enter a valid price greater than 0";
    if (!durationMinutes || Number(durationMinutes) <= 0)
      newErrors.duration = "Enter a valid duration";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      _id: service?._id || "",
      name: name.trim(),
      category,
      price: Number(price),
      durationMinutes: Number(durationMinutes),
      description: description.trim(),
    });
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
              <Scissors size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-(--ink)">
                {service ? "Edit Service" : "Add New Service"}
              </h2>
              <p className="text-xs text-(--muted)">
                {service
                  ? "Update service details and pricing"
                  : "Offer a new service to your clients"}
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
            label="Service Name"
            placeholder="e.g. Classic Haircut & Styling"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />

          {/* Category Selection */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="category"
              className="text-xs font-bold text-(--ink)"
            >
              Category <span className="text-(--rose)">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ServiceCategory)}
              className="w-full appearance-none rounded-lg border border-(--line) bg-(--surface) px-3.5 py-3 text-sm text-(--ink) outline-none transition cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              name="price"
              label="Price (₹ INR)"
              type="number"
              placeholder="e.g. 450"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={errors.price}
              required
            />
            <TextField
              name="durationMinutes"
              label="Duration (Minutes)"
              type="number"
              placeholder="e.g. 45"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              error={errors.duration}
              required
            />
          </div>

          <TextField
            name="description"
            label="Description (Optional)"
            multiline
            rows={3}
            placeholder="Brief details about what the service includes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

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
              <span>{service ? "Save Changes" : "Create Service"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;
