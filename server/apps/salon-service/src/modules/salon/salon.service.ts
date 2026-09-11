import { Types } from "mongoose";
import { AppError } from "@/handlers/AppError.js";
import SalonModel, {
  DEFAULT_BUSINESS_HOURS,
  type ISalon,
} from "./salon.model.js";
import {
  isCloudinaryConfigured,
  uploadImageToCloudinary,
} from "@/utils/cloudinary.js";
import type {
  getAllSalonQuery,
  SalonCreationRequest,
  UpdateSalonRequest,
} from "./salon.types.js";
import StaffModel from "@/modules/staff/staff.model.js";
import ServiceModel from "@/modules/services/services.model.js";
import redis from "@/config/redis.js";

// ==================== SALON METHODS ====================

export const getAllSalons = async (query: getAllSalonQuery) => {
  try {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 6));
    const skip = (page - 1) * limit;

    const cacheKey = `salons:all:page:${page}:limit:${limit}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const [salons, total] = await Promise.all([
      SalonModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      SalonModel.countDocuments(),
    ]);
    const result = {
      salons,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    await redis.setex(cacheKey, 3600, JSON.stringify(result)); // Expires in 1 hour

    return result;
  } catch (error) {
    throw error;
  }
};

export const getSalonById = async (id: string) => {
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid Salon ID", 400);
    }
    const cachedKey = `salon:${id}`;
    const cachedSalon = await redis.get(cachedKey);
    if (cachedSalon) {
      return JSON.parse(cachedSalon);
    }
    const salon = await SalonModel.findById(id);
    if (!salon) {
      throw new AppError("Salon not found", 404);
    }

    const [services, staff] = await Promise.all([
      ServiceModel.find({ salonId: salon._id }),

      StaffModel.find({ salonId: salon._id }),
    ]);

    await redis.set(cachedKey, JSON.stringify({ salon, services, staff }));

    return {
      salon,
      services,
      staff,
    };
  } catch (error) {
    throw error;
  }
};

export const getSalonByUser = async (ownerId: string) => {
  try {
    if (!ownerId) throw new AppError("Owner ID is required", 400);
    if (!Types.ObjectId.isValid(ownerId)) {
      throw new AppError("Invalid Owner.", 400);
    }

    const cacheKey = `salon:user:${ownerId}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const salon = await SalonModel.findOne({
      ownerId: new Types.ObjectId(ownerId),
    });

    if (!salon) throw new AppError("Salon not found", 404);

    await redis.setex(cacheKey, 3600, JSON.stringify(salon));

    return salon;
  } catch (error) {
    throw error;
  }
};

export const createSalon = async (
  data: SalonCreationRequest,
  ownerId: string,
) => {
  try {
    const existingSalon = await SalonModel.findOne({ ownerId });
    if (existingSalon)
      throw new AppError("You already have a registered salon", 409);

    const { email, phone } = data;

    const conflict = await SalonModel.findOne({
      $or: [{ email }, { phone }],
    });
    if (conflict) {
      if (conflict.email === email) {
        throw new AppError("Email already exists for another salon", 409);
      } else if (conflict.phone === phone) {
        throw new AppError("Phone already exists for another salon", 409);
      }
    }

    let payload = { ...data };

    const salon = await SalonModel.create({
      ...payload,
      ownerId: new Types.ObjectId(ownerId),
      isVerified: true,
      businessHours: DEFAULT_BUSINESS_HOURS,
    } as unknown as ISalon);

    await redis.del("salons:*");
    return salon;
  } catch (error) {
    throw error;
  }
};

export const updateSalon = async (
  salonId: string,
  data: UpdateSalonRequest,
) => {
  try {
    const existingSalon = await SalonModel.findById(salonId);
    if (!existingSalon) {
      throw new AppError("Salon profile not found", 404);
    }

    if (data.email || data.phone) {
      const conflict = await SalonModel.findOne({
        _id: { $ne: existingSalon._id },
        $or: [
          ...(data.email ? [{ email: data.email }] : []),
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      });

      if (conflict) {
        if (data.email && conflict.email === data.email) {
          throw new AppError("Email already exists", 409);
        }
        if (data.phone && conflict.phone === data.phone) {
          throw new AppError("Phone already exists", 409);
        }
      }
    }

    // If coverUrl is provided as a Base64 data URI, upload to Cloudinary
    let updatePayload = { ...data };
    if (
      updatePayload.coverUrl &&
      updatePayload.coverUrl.startsWith("data:image/") &&
      isCloudinaryConfigured()
    ) {
      updatePayload.coverUrl = await uploadImageToCloudinary(
        updatePayload.coverUrl,
        `salons/${existingSalon._id}/cover`,
      );
    }

    const updatedSalon = await SalonModel.findOneAndUpdate(
      { _id: salonId },
      { $set: updatePayload },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedSalon) {
      throw new AppError("Salon profile not found", 404);
    }
    const cachedKey = `salon:${updatedSalon._id}`;
    const cachedSalonByUser = `salon:user:${existingSalon.ownerId}`;
    await redis.del(cachedKey, cachedSalonByUser, "salons:*");

    return updatedSalon;
  } catch (error) {
    throw error;
  }
};

export const deleteSalon = async (salonId: string) => {
  try {
    if (!Types.ObjectId.isValid(salonId)) {
      throw new AppError("Invalid Salon ID", 400);
    }
    const existingSalon = await SalonModel.findById(salonId);
    if (!existingSalon) {
      throw new AppError("Salon profile not found", 404);
    }

    // Cascade delete child services and staff
    await Promise.all([
      ServiceModel.deleteMany({ salonId }),
      StaffModel.deleteMany({ salonId }),
      SalonModel.findByIdAndDelete(salonId),
    ]);

    const cacheKey = `salon:${salonId}`;
    const cacheServicesKey = `services:${salonId}`;
    const cacheStaffKey = `staff:${salonId}`;
    const cachedSalonByUser = `salon:user:${existingSalon.ownerId}`;

    await redis.del(
      cacheKey,
      cacheServicesKey,
      cacheStaffKey,
      cachedSalonByUser,
      "salons:*",
    );

    return true;
  } catch (error) {
    throw error;
  }
};
