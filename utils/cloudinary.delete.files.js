import { extractPublicId } from "cloudinary-build-url";
import cloudinary from "../config/cloudinary.config.js";

/**
 * Deletes files from Cloudinary.
 *
 * @param {string[]} files - An array of file URLs to be deleted from Cloudinary.
 * @returns {Promise<Object[]>} A promise that resolves to an array of results from the deletion operations.
 */
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
