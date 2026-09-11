import React, { useEffect } from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  icon?: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  icon,
  onConfirm,
  onClose,
  isLoading = false,
}) => {
  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
          defaultIcon: <AlertCircle size={24} />,
          confirmButton:
            "bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500",
        };
      case "warning":
        return {
          iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          defaultIcon: <AlertTriangle size={24} />,
          confirmButton:
            "bg-amber-600 hover:bg-amber-700 text-white shadow-xs focus:ring-amber-500",
        };
      case "primary":
      default:
        return {
          iconBg: "bg-(--rose)/10 text-(--rose)",
          defaultIcon: <Info size={24} />,
          confirmButton:
            "bg-(--rose) hover:opacity-90 text-white shadow-xs focus:ring-(--rose)",
        };
    }
  };

  const { iconBg, defaultIcon, confirmButton } = getVariantStyles();

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isLoading) onClose();
        }}
        aria-hidden="true"
      />

      {/* Dialog Container */}
      <div className="relative bg-(--surface) text-(--ink) border border-(--line) rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div
          className={`size-12 rounded-2xl ${iconBg} flex items-center justify-center mx-auto`}
        >
          {icon || defaultIcon}
        </div>

        <div className="text-center space-y-1.5">
          <h3
            id="confirmation-dialog-title"
            className="text-lg font-bold text-(--ink)"
          >
            {title}
          </h3>
          {description && (
            <div
              id="confirmation-dialog-description"
              className="text-xs sm:text-sm text-(--muted)"
            >
              {description}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl border border-(--line) bg-(--soft) hover:bg-(--line)/40 text-xs font-semibold text-(--ink) transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${confirmButton}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
