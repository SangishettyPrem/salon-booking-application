import { env } from "@/config/env.config.js";
import axios from "axios";

const SALON_SERVICE_URL = env.salonServiceURL;

export const getSalonBusinessHours = async (salonId: string) => {
  const response = await axios.get(
    `${SALON_SERVICE_URL}/internal/salons/${salonId}/business-hours`,
  );

  return response.data.data;
};
