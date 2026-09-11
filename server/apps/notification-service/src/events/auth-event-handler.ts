import {
  sendOTP,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
} from "@/services/auth.email.services.js";

export const handleAuthEvent = async (event: string, payload: any) => {
  console.log("auth event");
  switch (event) {
    case "password.reset.requested":
      await sendPasswordResetEmail(payload);
      break;
    case "password.reset.success":
      await sendPasswordResetSuccessEmail(payload);
      break;
    case "otp.sent":
      await sendOTP(payload);
      break;
    default:
      console.log("Unknown Event: ", event);
  }
};
