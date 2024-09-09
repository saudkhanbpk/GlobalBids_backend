import cloudinary from "../config/cloudinary.config.js";
import { FileUploadError } from "../error/AppError.js";

export const uploadProfileImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "profile-images",
    });
    return result.secure_url;
  } catch (err) {
    throw new FileUploadError("Can't upload image");
  }
};
