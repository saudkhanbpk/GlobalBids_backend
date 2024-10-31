import { FileUploadError, InternalServerError } from "../error/AppError.js";
import { uploadFile } from "../services/upload.files.media.service.js";
import { getUserById } from "../services/user.service.js";

export const uploadAvatar = async (req, res, next) => {
  const file = req.file;
  const userId = req.user._id;
  if (!file) {
    return next(new FileUploadError("Please upload a file!"));
  }
  try {
    const user = await getUserById(userId);
    const avatarUrl = await uploadFile(file, "profile-images");
    user.avatarUrl = avatarUrl;
    await user.save();
    return res.status(200).json({ success: true, avatarUrl });
  } catch (error) {
    return next(new InternalServerError("Can't upload user avatar"));
  }
};
