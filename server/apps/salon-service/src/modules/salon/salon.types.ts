import type { z } from "zod";
import type { createSalonSchema, updateSalonSchema } from "./salon.schema.js";

export type SalonCreationRequest = z.infer<typeof createSalonSchema>;
export type UpdateSalonRequest = z.infer<typeof updateSalonSchema>;

export interface getAllSalonQuery {
  page?: number;
  limit?: number;
}
