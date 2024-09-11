import cloudinary from "../config/cloudinary.config.js";
export const uploadFile = async (file, directory) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: directory,
    resource_type: file.mimetype === "video/mp4" ? "video" : "auto", 
    chunk_size: 100 * 1024 * 1024,
  });
  return result.secure_url;
};
