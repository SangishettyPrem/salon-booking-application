import type { NextFunction, Request, Response } from "express";
import * as salonService from "./staff.services.js";

export const getStaffBySalon = async (
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
    const staff = await salonService.getStaffBySalon(salonId);
    return res.status(200).json({
      success: true,
      message: "Staff members fetched successfully",
      staff,
    });
  } catch (error) {
    next(error);
  }
};

export const createStaff = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user?._id;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const staffMember = await salonService.createStaff(ownerId, req.body);
    return res.status(201).json({
      success: true,
      message: "Staff member added successfully",
      staff: staffMember,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (
  req: Request<{ staffId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user?._id;
    const { staffId } = req.params;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!staffId || typeof staffId !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Staff ID is required" });
    }
    const staffMember = await salonService.updateStaff(
      staffId,
      ownerId,
      req.body,
    );
    return res.status(200).json({
      success: true,
      message: "Staff member updated successfully",
      staff: staffMember,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (
  req: Request<{ staffId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user?._id;
    const { staffId } = req.params;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    await salonService.deleteStaff(staffId, ownerId);
    return res.status(200).json({
      success: true,
      message: "Staff member removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
