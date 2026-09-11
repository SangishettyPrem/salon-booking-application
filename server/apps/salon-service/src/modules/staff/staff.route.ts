import { allowedRoles, attachUser } from "@/middlewares/auth.middleware.js";
import { validate } from "@/middlewares/validate.middleware.js";
import { Router } from "express";
import { createStaffSchema, updateStaffSchema } from "./staff.schema.js";
import * as staffController from "./staff.controller.js";

const router = Router();

// Owner Staff Management
router.post(
  "/:salonId",
  attachUser,
  allowedRoles("owner", "admin"),
  validate(createStaffSchema),
  staffController.createStaff,
);
router.put(
  "/:staffId",
  attachUser,
  allowedRoles("owner", "admin"),
  validate(updateStaffSchema),
  staffController.updateStaff,
);

router.delete(
  "/:staffId",
  attachUser,
  allowedRoles("owner", "admin"),
  staffController.deleteStaff,
);

export default router;
