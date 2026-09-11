import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { env } from "@/config/env.config.js";
import { AppError } from "@/handlers/AppError.js";

// Configure Cloudinary instance
cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

/**
 * Check if Cloudinary credentials are configured
 */
export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    env.cloudinary.cloudName &&
    env.cloudinary.apiKey &&
    env.cloudinary.apiSecret,
  );
};

/**
 * Upload an image buffer (from Multer memory storage) to Cloudinary
 * @param buffer - File buffer from Multer
 * @param folder - Cloudinary folder path
 * @returns Secure URL of uploaded image
 */
export const uploadImageBuffer = (
  buffer: Buffer,
  folder: string = "salons/covers",
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(
        new AppError(
          "Cloudinary credentials are not configured in environment variables.",
          500,
        ),
      );
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto:good", fetch_format: "auto" }],
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(
            new AppError(
              error?.message || "Failed to upload image to Cloudinary",
              500,
            ),
          );
        }
        resolve(result.secure_url);
      },
    );

    uploadStream.end(buffer);
  });
};

/**
 * Upload a Base64 or Data URI string directly to Cloudinary
 * @param base64OrDataUri - Base64 encoded string or Data URI
 * @param folder - Cloudinary folder path
 * @returns Secure URL of uploaded image
 */
export const uploadImageToCloudinary = async (
  base64OrDataUri: string,
  folder: string = "salons/covers",
): Promise<string> => {
  if (!isCloudinaryConfigured()) {
    throw new AppError(
      "Cloudinary credentials are not configured in environment variables.",
      500,
    );
  }

  try {
    const result = await cloudinary.uploader.upload(base64OrDataUri, {
      folder,
      resource_type: "image",
      transformation: [{ quality: "auto:good", fetch_format: "auto" }],
    });
    return result.secure_url;
  } catch (error: any) {
    throw new AppError(
      error?.message || "Failed to upload Base64 image to Cloudinary",
      500,
    );
  }
};

/**
 * Delete an image from Cloudinary by its public ID or full URL
 * @param publicIdOrUrl - Cloudinary public_id or image URL
 */
export const deleteImageFromCloudinary = async (
  publicIdOrUrl: string,
): Promise<void> => {
  if (!isCloudinaryConfigured() || !publicIdOrUrl) return;

  try {
    let publicId = publicIdOrUrl;
    // Extract public_id if full Cloudinary URL is provided
    if (publicIdOrUrl.includes("res.cloudinary.com")) {
      const parts = publicIdOrUrl.split("/");
      const uploadIndex = parts.indexOf("upload");
      if (uploadIndex !== -1) {
        // Skip version segment (e.g. v1612345678) if present
        const pathAfterUpload = parts.slice(uploadIndex + 1);
        if (
          pathAfterUpload[0]?.startsWith("v") &&
          !isNaN(Number(pathAfterUpload[0].slice(1)))
        ) {
          pathAfterUpload.shift();
        }
        const fileWithExt = pathAfterUpload.join("/");
        publicId = fileWithExt.replace(/\.[^/.]+$/, "");
      }
    }
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Non-blocking cleanup failure
    console.error("Cloudinary cleanup error:", error);
  }
};

export default cloudinary;
