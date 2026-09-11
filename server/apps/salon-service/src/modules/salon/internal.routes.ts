import { Router } from "express";
import { getSalonBusinessHours } from "./internal.controller.js";

const router = Router();

router.get("/salons/:salonId/business-hours", getSalonBusinessHours);

export default router;
