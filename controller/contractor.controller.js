import { InternalServerError, NotFoundError } from "../error/AppError.js";
import ContractorProfileModel from "../model/contractor.profile.model.js";
import ContractorSettingsModel from "../model/contractor.settings.model.js";
import { getProfileByUserId } from "../services/profile.service.js";
import { uploadProfileImage } from "../services/upload.image.service.js";
import { getUserById } from "../services/user.service.js";
import JobModel from "../model/job.model.js";

export const contractorProfileController = async (req, res, next) => {
  const data = req.body;
  const file = req.file;

  try {
    let imageUrl = "";
    if (file) {
      imageUrl = await uploadProfileImage(file);
      const user = await getUserById(data.userId);
      if (imageUrl) {
        user.imageUrl = imageUrl;
        await user.save();
      }
    }

    let services = "";
    if (data.services) {
      services = JSON.parse(data.services);
    }
    let professionalExperience = "";
    if (data.professionalExperience) {
      professionalExperience = JSON.parse(data.professionalExperience);
    }

    let contractorProfile = await ContractorProfileModel.findOne({
      user: data.userId,
    });

    if (contractorProfile) {
      contractorProfile.licenseNumber =
        data.licenseNumber || contractorProfile.licenseNumber;
      contractorProfile.insuranceInformation =
        data.insuranceInformation || contractorProfile.insuranceInformation;
      contractorProfile.services = services || contractorProfile.services;
      contractorProfile.professionalExperience =
        professionalExperience || contractorProfile.professionalExperience;

      await contractorProfile.save();

      const populatedProfile = await ContractorProfileModel.findById(
        contractorProfile._id
      ).populate({
        path: "user",
        select: "imageUrl",
      });

      return res.status(200).json({
        success: true,
        message: "Contractor profile updated successfully!",
        contractorProfile: populatedProfile,
      });
    }

    contractorProfile = new ContractorProfileModel({
      user: data.userId,
      licenseNumber: data.licenseNumber || null,
      insuranceInformation: data.insuranceInformation || null,
      services: services || null,
      professionalExperience: professionalExperience || null,
    });

    await contractorProfile.save();

    const populatedProfile = await ContractorProfileModel.findById(
      contractorProfile._id
    ).populate({
      path: "user",
      select: "imageUrl",
    });

    return res.status(201).json({
      success: true,
      message: "Contractor profile created successfully!",
      contractorProfile: populatedProfile,
    });
  } catch (error) {
    console.log(error);
    return next(new InternalServerError());
  }
};

export const getContractorProfileController = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const profile = await getProfileByUserId(userId);
    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const contractorSettings = async (req, res, next) => {
  const userId = req.user._id;
  const role = req.user.role;

  if (role !== "contractor") {
    return next(new BusinessLogicError());
  }

  try {
    const existingSettings = await ContractorSettingsModel.findOne({
      user: userId,
    });

    if (existingSettings) {
      existingSettings.notifications =
        req.body.notifications || existingSettings.notifications;

      existingSettings.profileVisibility =
        req.body.profileVisibility || existingSettings.profileVisibility;

      await existingSettings.save();

      return res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        settings: existingSettings,
      });
    }

    const newSettings = new ContractorSettingsModel({
      user: userId,
      notifications: req.body.notifications,
      profileVisibility: req.body.profileVisibility,
    });

    await newSettings.save();

    return res.status(200).json({
      success: true,
      message: "Settings created successfully",
      settings: newSettings,
    });
  } catch (error) {
    console.error(error);
    return next(new InternalServerError("Failed to update settings"));
  }
};

export const getContractorSettings = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const settings = await ContractorSettingsModel.findOne({
      user: userId,
    });
    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    return next(new InternalServerError(""));
  }
};

export const getJobDetails = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const jobDetails = await JobModel.findById(jobId);

    if (!jobDetails) {
      return next(new NotFoundError());
    }
    return res.status(200).json({ success: true, job: jobDetails });
  } catch (error) {
    return next(new InternalServerError());
  }
};
