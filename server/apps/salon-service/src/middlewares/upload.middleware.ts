import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { AppError } from "@/handlers/AppError.js";

// Keep files in memory as Buffers for direct streaming to Cloudinary
const storage = multer.memoryStorage();

// File filter to allow only image files
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.",
        400,
      ) as unknown as null,
      false,
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter,
});

/**
 * Middleware for single image upload with error handling
 * @param fieldName Form field name (default: "cover")
 */
export const uploadSingleImage = (fieldName: string = "cover") => {
  return upload.single(fieldName);
};
