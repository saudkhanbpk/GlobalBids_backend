import { FileUploadError, InternalServerError } from "../error/AppError.js";
import { uploadFile } from "../services/upload.files.media.service.js";

export const uploadAvatar = async (req, res, next) => {
  const file = req.file;
  if (!file) {
    return next(new FileUploadError("Please upload a file!"));
  }
  try {
    const avatarUrl = await uploadFile(file, "profile-images");
    return res.status(200).json({ success: true, avatarUrl });
  } catch (error) {
    return next(new InternalServerError("Can't upload user avatar"));
  }
};
