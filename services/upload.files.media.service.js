import cloudinary from "../config/cloudinary.config.js";
import fs from "fs";
export const uploadFile = async (file, directory) => {
  try {
    const supportedFormats = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/postscript",
      "video/mp4",
    ];

    if (!supportedFormats.includes(file.mimetype)) {
      const error = new Error();
      error.message =
        "Unsupported file format. Only .jpg, .png, .pdf, .ai, and .mp4 are allowed.";
      error.code = 415;
      throw error;
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: directory,
      resource_type: file.mimetype === "video/mp4" ? "video" : "auto",
      chunk_size: 100 * 1024 * 1024,
    });
    fs.unlinkSync(file.path);
    return result.secure_url;
  } catch (error) {
    fs.unlinkSync(file.path);
    throw new Error("Can't upload file.");
  }
};
