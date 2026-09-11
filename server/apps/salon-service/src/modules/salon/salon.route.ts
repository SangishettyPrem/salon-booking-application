import Router from "express";
import * as salonController from "@/modules/salon/salon.controller.js";
import * as serviceController from "@/modules/services/services.controller.js";
import * as staffController from "@/modules/staff/staff.controller.js";
import { allowedRoles, attachUser } from "@/middlewares/auth.middleware.js";
import { validate } from "@/middlewares/validate.middleware.js";
import { uploadSingleImage } from "@/middlewares/upload.middleware.js";
import {
  createSalonSchema,
  updateSalonSchema,
} from "@/modules/salon/salon.schema.js";
import ServicesRoutes from "@/modules/services/services.route.js";
import StaffRoutes from "@/modules/staff/staff.route.js";

const router = Router();

router.use("/services", ServicesRoutes);
router.use("/staff", StaffRoutes);

// ==================== PUBLIC ROUTES ====================
router.get("/all", salonController.getAllSalons);
router.get("/:salonId/services", serviceController.getServicesBySalon);
router.get("/:salonId/staff", staffController.getStaffBySalon);

// ==================== SALON OWNER / PROTECTED ROUTES ====================

router.get(
  "/me",
  attachUser,
  allowedRoles("owner"),
  salonController.getSalonByUser,
);

router.post(
  "/",
  attachUser,
  allowedRoles("owner", "admin"),
  validate(createSalonSchema),
  salonController.createSalon,
);

router.put(
  "/:salonId",
  attachUser,
  allowedRoles("owner"),
  validate(updateSalonSchema),
  uploadSingleImage("cover"),
  salonController.updateSalon,
);

router.delete(
  "/:salonId",
  attachUser,
  allowedRoles("owner", "admin"),
  salonController.deleteSalon,
);

/* ==================== PUBLIC SALON DETAILS ==================== */

router.get("/:id", salonController.getSalonById);

export default router;
