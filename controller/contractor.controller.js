import { InternalServerError } from "../error/AppError.js";
import ContractorProfileModel from "../model/contractor.profile.model.js";
import { getProfileByUserId } from "../services/profile.service.js";
import { uploadProfileImage } from "../services/upload.image.service.js";
import { getUserById } from "../services/user.service.js";

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
