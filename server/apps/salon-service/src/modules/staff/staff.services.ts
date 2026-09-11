import { AppError } from "@/handlers/AppError.js";
import { Types } from "mongoose";
import StaffModel from "./staff.model.js";
import SalonModel from "../salon/salon.model.js";
import type { CreateStaffRequest } from "./staff.types.js";
import redis from "@/config/redis.js";

export const getStaffBySalon = async (salonId: string) => {
  try {
    if (!Types.ObjectId.isValid(salonId)) {
      throw new AppError("Invalid Salon ID", 400);
    }
    const cachedKey = `staff:${salonId}`;
    const cachedData = await redis.get(cachedKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const staff = await StaffModel.find({ salonId }).sort({ role: 1, name: 1 });
    await redis.set(cachedKey, JSON.stringify(staff), "EX", 3600);
    return staff;
  } catch (error) {
    throw error;
  }
};

export const createStaff = async (
  ownerId: string,
  data: CreateStaffRequest,
) => {
  try {
    const salon = await SalonModel.findOne({ ownerId });
    if (!salon) {
      throw new AppError("You must create a salon profile first", 404);
    }
    const { assignedServices, email, name, phone, role } = data;

    if (!email && !phone) {
      throw new AppError("Email or phone number is required", 400);
    }

    const AllStaffOfSalon = await StaffModel.find({
      salonId: salon._id,
    });

    if (AllStaffOfSalon.some((staff) => staff.email === email))
      throw new AppError("Staff member with this email already exists", 400);
    if (AllStaffOfSalon.some((staff) => staff.phone === phone))
      throw new AppError("Staff member with this phone already exists", 400);

    const staffMember = await StaffModel.create({
      salonId: salon._id,
      name,
      email,
      phone,
      role,
      assignedServices,
    });

    const cachedKey = `staff:${salon._id}`;
    await redis.del(cachedKey);

    return staffMember;
  } catch (error) {
    throw error;
  }
};

export const updateStaff = async (
  staffId: string,
  ownerId: string,
  data: any,
) => {
  try {
    const salon = await SalonModel.findOne({ ownerId });
    if (!salon) throw new AppError("Salon not found", 404);

    const staffMember = await StaffModel.findOne({
      _id: staffId,
      salonId: salon._id,
    });
    if (!staffMember)
      throw new AppError("Staff member not found or unauthorized", 404);

    const updated = await StaffModel.findByIdAndUpdate(
      staffId,
      { $set: data },
      { new: true, runValidators: true },
    );
    const cachedKey = `staff:${salon._id}`;
    await redis.del(cachedKey);
    return updated;
  } catch (error) {
    throw error;
  }
};

export const deleteStaff = async (staffId: string, ownerId: string) => {
  try {
    if (!Types.ObjectId.isValid(staffId)) {
      throw new AppError("Invalid Staff ID", 400);
    }
    const salon = await SalonModel.findOne({ ownerId });
    if (!salon) throw new AppError("Salon not found", 404);

    const staffMember = await StaffModel.findOneAndDelete({
      _id: staffId,
      salonId: salon._id,
    });
    if (!staffMember) throw new AppError("Staff member not found", 404);

    const cachedKey = `staff:${salon._id}`;
    await redis.del(cachedKey);

    return true;
  } catch (error) {
    throw error;
  }
};
