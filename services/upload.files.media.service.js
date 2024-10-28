import cloudinary from "../config/cloudinary.config.js";

export const uploadFile = async (file, directory) => {
  const supportedFormats = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/postscript",
    "video/mp4",
  ];

  if (!supportedFormats.includes(file.mimetype)) {
    const error = new Error(
      "Unsupported file format. Only .jpg, .png, .pdf, .ai, and .mp4 are allowed."
    );
    error.code = 415;
    throw error;
  }

  const result = await cloudinary.uploader.upload(file.path, {
    folder: directory,
    resource_type: file.mimetype === "video/mp4" ? "video" : "auto",
    chunk_size: 100 * 1024 * 1024,
  });
  return result.secure_url;
};
