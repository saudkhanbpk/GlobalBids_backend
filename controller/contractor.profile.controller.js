import { InternalServerError } from "../error/AppError.js";
import ContractorProfileModel from "../model/contractor.profile.model.js";
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
      }
      await user.save();
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

      const populatedProfile = await contractorProfile.populate("user");

      return res.status(200).json({
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

    const populatedProfile = await contractorProfile.populate("user");

    return res.status(201).json({
      message: "Contractor profile created successfully!",
      contractorProfile: populatedProfile,
    });
  } catch (error) {
    console.log(error);
    return next(new InternalServerError());
  }
};