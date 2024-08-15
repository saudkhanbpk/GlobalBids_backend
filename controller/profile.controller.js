import ProfileModel from "../model/profile.model.js";
import multer from "multer";
import {
  ValidationError,
  InternalServerError,
  BusinessLogicError,
  FileSizeLimitExceededError,
} from "../error/AppError.js";
import cloudinary from "../config/cloudinary.config.js";

export const ProfileController = async (req, res, next) => {
  try {
    const file = req.file;

    const requiredFields = [
      "userId",
      "workTitle",
      "experience",
      "education",
      "languages",
      "skills",
      "description",
      "hourlyRate",
      "firstName",
      "lastName",
      "address",
      "cityName",
      "country",
      "zipCode",
      "phone",
    ];

    let secureUrl = "";
    if (file) {
      await cloudinary.uploader.upload(file.path, async function (err, result) {
        if (err) {
          next(new FileUploadError("can't upload image"));
        }
        secureUrl = result.secure_url;
      });
    }

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return next(
        new ValidationError(`Missing fields: ${missingFields.join(", ")}`)
      );
    }

    const { userId, languages, skills, ...rest } = req.body;

    const parsedLanguages = JSON.parse(languages);
    const parsedSkills = JSON.parse(skills);

    const existingProfile = await ProfileModel.findOne({ user: userId });
    if (existingProfile) {
      return next(
        new BusinessLogicError("Profile already exists for this user.")
      );
    }

    const profile = new ProfileModel({
      user: userId,
      languages: parsedLanguages,
      skills: parsedSkills,
      ...rest,
    });

    if (secureUrl) {
      profile.imageUrl = secureUrl;
    }

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
      next(new ValidationError(error.message));
    } else if (error.name === "BusinessLogicError") {
      next(new BusinessLogicError(error.message));
    } else {
      next(
        new InternalServerError("An error occurred while creating the profile.")
      );
    }
  }
};
