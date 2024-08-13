import UserModel from "../model/user.model.js";
import { ValidationError, InternalServerError } from "../error/AppError.js";

// Email Check Controller
export const emailCheckController = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ValidationError("Email is required to create an account"));
  }

  try {
    const user = await UserModel.findByEmail(email);

    if (user) {
      return next(new ValidationError("User already exists"));
    }

    return res.status(200).json({ success: true, message: "Create account!" });
  } catch (error) {
    return next(new InternalServerError());
  }
};

// Sign Up Controller
export const signUpController = async (req, res, next) => {
  const {
    email,
    firstName,
    lastName,
    workRole,
    country,
    sendSms,
    termsOfServices,
    password,
  } = req.body;

  if (
    !(
      email &&
      firstName &&
      lastName &&
      workRole &&
      country &&
      sendSms &&
      termsOfServices &&
      password
    )
  ) {
    return next(new ValidationError("All fields are required"));
  }

  const newSendSms = sendSms === "on";
  const newTermsOfServices = termsOfServices === "on";

  try {
    const user = new UserModel({
      email,
      firstName,
      lastName,
      workRole,
      country,
      sendSms: newSendSms,
      termsOfServices: newTermsOfServices,
      password,
    });

    const newUser = await user.save();
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: newUser,
    });
  } catch (error) {
    if (error.errorResponse.code === 11000) {
      return next(new ValidationError("User already exist"));
    }
    return next(new InternalServerError());
  }
};
