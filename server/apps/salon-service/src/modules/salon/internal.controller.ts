import type { Request, Response, NextFunction } from "express";
import SalonModel from "./salon.model.js";
import redis from "@/config/redis.js";

export const getSalonBusinessHours = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { salonId } = req.params;
    const cachedKey = `salon:businessHours:${salonId}`;

    const cachedSalon = await redis.get(cachedKey);

    if (cachedSalon) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedSalon),
      });
    }

    const salon = await SalonModel.findById(salonId)
      .select("_id businessHours")
      .lean();

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found",
      });
    }

    await redis.setex(cachedKey, 3600, JSON.stringify(salon));

    return res.status(200).json({
      success: true,
      data: {
        salonId: salon._id,
        businessHours: salon.businessHours,
      },
    });
  } catch (error) {
    next(error);
  }
};
