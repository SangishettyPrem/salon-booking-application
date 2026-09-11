import { AppError } from "@/handlers/AppError.js";
import ServiceModel from "./services.model.js";
import { Types } from "mongoose";
import SalonModel from "../salon/salon.model.js";
import redis from "@/config/redis.js";
import type { ServiceRequest } from "./services.types.js";

export const getServicesBySalon = async (salonId: string) => {
  try {
    if (!Types.ObjectId.isValid(salonId)) {
      throw new AppError("Invalid Salon ID", 400);
    }
    const cachedKey = `services:${salonId}`;
    const cachedData = await redis.get(cachedKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const services = await ServiceModel.find({ salonId }).sort({
      category: 1,
      name: 1,
    });
    await redis.set(cachedKey, JSON.stringify(services));
    return services;
  } catch (error) {
    throw error;
  }
};

export const createService = async (salonId: string, data: ServiceRequest) => {
  try {
    const salon = await SalonModel.findById(salonId);
    if (!salon) {
      throw new AppError("You must create a salon profile first", 404);
    }

    const service = await ServiceModel.create({
      ...data,
      salonId: salon._id,
    });

    const cachedKey = `services:${salonId}`;
    await redis.del(cachedKey);

    return service;
  } catch (error) {
    throw error;
  }
};

export const updateService = async (
  serviceId: string,
  ownerId: string,
  data: ServiceRequest,
) => {
  try {
    if (!Types.ObjectId.isValid(serviceId)) {
      throw new AppError("Invalid Service ID", 400);
    }
    const salon = await SalonModel.findOne({ ownerId });
    if (!salon) throw new AppError("Salon not found", 404);

    const service = await ServiceModel.findOne({
      _id: serviceId,
      salonId: salon._id,
    });
    if (!service) throw new AppError("Service not found or unauthorized", 404);

    const updated = await ServiceModel.findByIdAndUpdate(
      serviceId,
      { $set: data },
      { new: true, runValidators: true },
    );

    const cachedKey = `services:${salon._id}`;
    await redis.del(cachedKey);

    return updated;
  } catch (error) {
    throw error;
  }
};

export const deleteService = async (serviceId: string, ownerId: string) => {
  try {
    if (!Types.ObjectId.isValid(serviceId)) {
      throw new AppError("Invalid service id", 400);
    }
    const salon = await SalonModel.findOne({ ownerId });
    if (!salon) throw new AppError("Salon not found", 404);

    const service = await ServiceModel.findOneAndDelete({
      _id: serviceId,
      salonId: salon._id,
    });
    if (!service) throw new AppError("Service not found", 404);

    const cachedKey = `services:${salon._id}`;
    await redis.del(cachedKey);
    return true;
  } catch (error) {
    throw error;
  }
};
