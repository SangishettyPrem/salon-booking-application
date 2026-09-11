import toast, { type ToastPosition } from "react-hot-toast";

export const handleError = (
  message: string,
  position: ToastPosition = "top-right",
) => toast.error(message, { position });

export const handleSuccess = (
  message: string,
  position: ToastPosition = "top-right",
) => toast.success(message, { position });

export const handleInfo = (
  message: string,
  position: ToastPosition = "top-right",
) => toast(message, { position });

export const handleWarning = (
  message: string,
  position: ToastPosition = "top-right",
) => toast(message, { position });
