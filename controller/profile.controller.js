import ProfileModel from "../model/profile.model.js";
import multer from "multer";
import {
  ValidationError,
  InternalServerError,
  BusinessLogicError,
  FileSizeLimitExceededError,
} from "../error/AppError.js";
import cloudinary from "../config/cloudinary.config.js";
import { getProfileByUserId } from "../services/profile.service.js";
import { validateContractorProfile, validateOwnerProfile  } from "../validators/profile-validator.js";


export const createProfileController = async (req, res, next) => {
  try {
    const file = req.file;
    const { userId, languages, skills, ...rest } = req.body;
    const { workRole } = req.user;
    

    const parsedLanguages = languages ? JSON.parse(languages) : [];
    const parsedSkills = skills ? JSON.parse(skills) : [];

    if (workRole === "contractor") {      
      const validationErrors = validateContractorProfile({
        userId,
        languages: parsedLanguages,
        skills: parsedSkills,
        ...rest,
      });
      if (Object.keys(validationErrors).length > 0) {
        return next(
          new ValidationError(
            `Validation errors: ${JSON.stringify(validationErrors)}`
          )
        );
      }
    } else if (workRole === "owner") {      
      const validationErrors = validateOwnerProfile({
        userId,
        ...rest,
      });

      console.log(validationErrors);
      

      if (Object.keys(validationErrors).length > 0) {
        return next(
          new ValidationError(
            `Validation errors: ${JSON.stringify(validationErrors)}`
          )
        );
      }
    } else {
      return next(new BusinessLogicError("Invalid user role."));
    }

    let secureUrl = "";
    if (file) {
      await cloudinary.uploader.upload(file.path, async function (err, result) {
        if (err) {
          return next(new FileUploadError("Can't upload image"));
        }
        secureUrl = result.secure_url;
      });
    }

    const existingProfile = await ProfileModel.findOne({ user: userId });
    if (existingProfile) {
      return next(
        new BusinessLogicError("Profile already exists for this user.")
      );
    }

    const profileData = {
      user: userId,
      ...rest,
    };

    if (workRole === "contractor") {
      profileData.languages = parsedLanguages;
      profileData.skills = parsedSkills;
    }

    if (secureUrl) {
      profileData.imageUrl = secureUrl;
    }

    const profile = new ProfileModel(profileData);
    const savedProfile = await profile.save();

    return res.status(201).json({
      status: "success",
      data: { profile: savedProfile },
    });
  } catch (error) {
    if (
      error instanceof multer.MulterError &&
      error.code === "LIMIT_FILE_SIZE"
    ) {
      return next(new FileSizeLimitExceededError());
    }
    if (error.name === "ValidationError") {
      return next(new ValidationError(error.message));
    } else if (error.name === "BusinessLogicError") {
      return next(new BusinessLogicError(error.message));
    } else {
      return next(
        new InternalServerError("An error occurred while creating the profile.")
      );
    }
  }
};


export const getProfileController = async (req, res, next) => {
  const user = req.user;

  try {
    const profile = await getProfileByUserId(user._id);
    if (!profile) {
      return next(new ValidationError("Profile Not Found"));
    }
    return res.status(201).json({ success: true, profile });
  } catch (error) {
    return next(new InternalServerError());
  }
};
