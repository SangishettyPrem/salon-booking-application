import { allowedRoles, attachUser } from "@/middlewares/auth.middleware.js";
import { validate } from "@/middlewares/validate.middleware.js";
import { Router } from "express";
import * as serviceController from "./services.controller.js";
import { createServiceSchema, updateServiceSchema } from "./services.schema.js";

const router = Router();

router.post(
  "/:salonId",
  attachUser,
  allowedRoles("owner", "admin"),
  validate(createServiceSchema),
  serviceController.createService,
);
router.put(
  "/:serviceId",
  attachUser,
  allowedRoles("owner", "admin"),
  validate(updateServiceSchema),
  serviceController.updateService,
);

router.delete(
  "/:serviceId",
  attachUser,
  allowedRoles("owner", "admin"),
  serviceController.deleteService,
);

export default router;
