import type { NextFunction, Request, Response } from "express";
import * as salonService from "./salon.service.js";
import { AppError } from "@/handlers/AppError.js";

// ==================== SALON CONTROLLERS ====================

export const getAllSalons = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await salonService.getAllSalons(req.query);
    return res.status(200).json({
      success: true,
      message: "Salons fetched successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSalonById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError("Invalid Request", 400);
    const data = await salonService.getSalonById(id.toString());
    return res.status(200).json({
      success: true,
      message: "Salon details fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getSalonByUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user?._id;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const salon = await salonService.getSalonByUser(ownerId);

    return res.status(200).json({
      success: true,
      message: "Salon fetched successfully",
      salon,
    });
  } catch (error) {
    next(error);
  }
};

export const createSalon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user?._id;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const salon = await salonService.createSalon(req.body, ownerId);
    return res
      .status(201)
      .json({ success: true, message: "Salon created successfully", salon });
  } catch (error) {
    next(error);
  }
};

export const updateSalon = async (
  req: Request<{ salonId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user?._id;
    const { salonId } = req.params;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const salon = await salonService.updateSalon(salonId, req.body);
    return res.status(200).json({
      success: true,
      message: "Salon profile updated successfully",
      salon,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSalon = async (
  req: Request<{ salonId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { salonId } = req.params;
    const ownerId = req.user?._id;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const result = await salonService.deleteSalon(salonId);
    if (result) {
      return res.status(200).json({
        success: true,
        message: "Salon profile deleted successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to delete salon profile",
      });
    }
  } catch (error) {
    next(error);
  }
};
