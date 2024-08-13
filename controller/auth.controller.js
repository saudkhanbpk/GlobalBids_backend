import UserModel from "../model/user.model.js";
import {
  ValidationError,
  NotFoundError,
  InternalServerError,
} from "../error/customError.js";

// Email Check Controller
export const emailCheckController = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required to create an account",
    });
  }

  try {
    const user = await UserModel.findByEmail(email);

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
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
     next(new ValidationError("All fields are required"));
  }

  const newSendSms = sendSms === "on" || false;
  const newTermsOfServices = termsOfServices === "on" || false;

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
    return res
      .status(201)
      .json({ success: true, message: "Account created successfully" });
  } catch (error) {
    return res.status(400).json({
      success: false,
    });
  }
};
