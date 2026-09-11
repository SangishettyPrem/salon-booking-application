import type { NextFunction, Request, Response } from "express";
import * as salonService from "./services.service.js";

export const getServicesBySalon = async (
  req: Request<{ salonId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { salonId } = req.params;
    if (!salonId || typeof salonId !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Salon ID is required" });
    }
    const services = await salonService.getServicesBySalon(salonId);
    return res.status(200).json({
      success: true,
      message: "Services fetched successfully",
      services,
    });
  } catch (error) {
    next(error);
  }
};

export const createService = async (
  req: Request<{ salonId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { salonId } = req.params;
    if (!salonId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const service = await salonService.createService(salonId, req.body);
    return res.status(201).json({
      success: true,
      message: "Service added successfully",
      service,
    });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (
  req: Request<{ serviceId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user?._id;
    const { serviceId } = req.params;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const service = await salonService.updateService(
      serviceId,
      ownerId,
      req.body,
    );
    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (
  req: Request<{ serviceId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user?._id;
    const { serviceId } = req.params;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await salonService.deleteService(serviceId, ownerId);
    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
