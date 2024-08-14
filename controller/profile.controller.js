import ProfileModel from "../model/profile.model.js";
import { ValidationError, InternalServerError } from "../error/AppError.js";

export const ProfileController = async (req, res, next) => {
  try {
    const {
      userId,
      workTitle,
      experience,
      education,
      languages,
      skills,
      description,
      hourlyRate,
      firstName,
      lastName,
      address,
      cityName,
      country,
      zipCode,
      phone,
    } = req.body;

    if (
      !(
        userId &&
        workTitle &&
        experience &&
        education &&
        languages &&
        skills &&
        description &&
        hourlyRate &&
        firstName &&
        lastName &&
        address &&
        cityName &&
        country &&
        zipCode &&
        phone
      )
    ) {
      return next(new ValidationError("All fields are required."));
    }

    const profile = new ProfileModel({
      user: userId,
      workTitle,
      experience,
      education,
      languages,
      skills,
      description,
      hourlyRate,
      firstName,
      lastName,
      address,
      cityName,
      country,
      zipCode,
      phone,
    });

    const savedProfile = await profile.save();

    res.status(201).json({
      status: "success",
      data: {
        profile: savedProfile,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      next(new ValidationError(error.message));
    } else {
      next(
        new InternalServerError("An error occurred while creating the profile.")
      );
    }
  }
};
