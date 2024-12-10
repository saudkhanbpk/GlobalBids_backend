import { FileUploadError, InternalServerError } from "../error/AppError.js";
import AccountModel from "../model/account.model.js";
import ContractorProfileModel from "../model/contractor.profile.model.js";
import { uploadFile } from "../services/upload.files.media.service.js";
import { deleteFilesFromCloudinary } from "../utils/cloudinary.delete.files.js";

export const uploadAvatar = async (req, res, next) => {
  const file = req.file;
  const userId = req.user._id;
  if (!file) {
    return next(new FileUploadError("Please upload a file!"));
  }
  try {
    const user = await AccountModel.findById(userId);
    const avatarUrl = await uploadFile(file, "profile-images");
    user.avatarUrl = avatarUrl;
    await user.save();
    return res.status(200).json({ success: true, avatarUrl });
  } catch (error) {
    return next(new InternalServerError("Can't upload user avatar"));
  }
};
export const uploadCoverPhoto = async (req, res, next) => {
  const file = req.file;
  const userId = req.user._id;
  if (!file) {
    return next(new FileUploadError("Please upload a file!"));
  }
  try {
    const user = await AccountModel.findById(userId);
    const coverPhoto = await uploadFile(file, "profile-images");
    user.coverPhoto = coverPhoto;
    await user.save();
    return res.status(200).json({ success: true, coverPhoto });
  } catch (error) {
    return next(new InternalServerError("Can't upload user avatar"));
  }
};

export const uploadContractorDocumentsController = async (req, res, next) => {
  const files = req.files;
  const userId = req.user._id;

  if (!files) {
    return next(new FileUploadError("Please upload a file!"));
  }

  try {
    const updateField = {};

    if (files.compensationFile && files.compensationFile[0]) {
      const fileUrl = await uploadFile(
        files.compensationFile[0],
        "contractor-documents"
      );
      updateField.compensationFile = fileUrl;
    }
    if (files.insuranceFile && files.insuranceFile[0]) {
      const fileUrl = await uploadFile(
        files.insuranceFile[0],
        "contractor-documents"
      );
      updateField.insuranceFile = fileUrl;
    }

    const user = await ContractorProfileModel.findOneAndUpdate(
      { user: userId },
      { $set: updateField },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Files uploaded successfully!",
      file: updateField,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    next(error);
  }
};

export const uploadPageMedia = async (req, res, next) => {
  const files = req.files;
  const userId = req.user._id;
  const deletedFiles = JSON.parse(req.body.deletedFiles || "[]");

  if (!files && deletedFiles.length === 0) {
    return next(
      new FileUploadError("Please upload a file or specify files to delete!")
    );
  }

  try {
    let newUrls = null;
    if (deletedFiles.length > 0) {
      await deleteFilesFromCloudinary(deletedFiles);
      newUrls = await ContractorProfileModel.findOneAndUpdate(
        { user: userId },
        { $pull: { portfolioMedia: { $in: deletedFiles } } },
        { new: true }
      );
    }

    const mediaUrls = files
      ? await Promise.all(files.map((file) => uploadFile(file, "page-media")))
      : [];

    if (mediaUrls.length > 0) {
      newUrls = await ContractorProfileModel.findOneAndUpdate(
        { user: userId },
        { $push: { portfolioMedia: { $each: mediaUrls } } },
        { upsert: true, new: true }
      );
    }

    return res
      .status(200)
      .json({ success: true, portfolioMedia: newUrls.portfolioMedia });
  } catch (error) {
    console.log(error);

    return next(new InternalServerError("Can't upload or delete page media"));
  }
};
