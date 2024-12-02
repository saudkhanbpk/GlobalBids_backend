import { extractPublicId } from "cloudinary-build-url";
import cloudinary from "../config/cloudinary.config.js";

export const deleteFilesFromCloudinary = async (files) => {
  const deletionPromises = files.map(async (fileUrl) => {
    try {
      const publicId = extractPublicId(fileUrl);
      const deletedFile = await cloudinary.uploader.destroy(publicId);
      return deletedFile;
    } catch (err) {
      console.error(`Failed to delete file: ${fileUrl}`, err);
    }
  });

  const result = await Promise.all(deletionPromises);
  return result;
};
