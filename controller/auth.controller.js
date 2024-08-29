import UserModel from "../model/user.model.js";
import {
  ValidationError,
  InternalServerError,
  LoginError,
} from "../error/AppError.js";
import generateAuthToken from "../utils/generte-auth-token.js";
import { getUserByEmail } from "../services/user.service.js";
import { signUpValidate } from "../validators/sign-up-validators.js";
import OtpModel from "../model/otp.model.js";
import { generateOtp } from "../utils/generate-otp.js";
import { sendEmail } from "../utils/send-emails.js";
import { otpMailOptions } from "../utils/mail-options.js";

export const signUpController = async (req, res, next) => {
  const userData = req.body;

  const validateData = signUpValidate(userData);

  if (validateData) {
    return next(new ValidationError(JSON.stringify(validateData)));
  }

  try {
    const user = new UserModel(userData);

    const newUser = await user.save();

    const newOtp = await OtpModel({
      otp: generateOtp(),
      userId: newUser._id,
    });

    await newOtp.save();

    const mailOpt = otpMailOptions(newOtp.otp, newUser.email);
    await sendEmail(mailOpt);

    const token = await generateAuthToken({
      id: newUser._id,
      email: newUser.email,
    });
    return res.status(201).json({
      success: true,
      message: "Please verify your account",
      user: newUser,
      token,
      otpId: newOtp._id,
    });
  } catch (error) {
    if (error?.errorResponse?.code === 11000) {
      return next(new ValidationError("User already exist"));
    }
    return next(new InternalServerError());
  }
};

export const loginController = async (req, res, next) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    return next(new ValidationError("Email and Password is Required"));
  }

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return next(new LoginError());
    }

    const passMatch = await user.comparePassword(password);
    if (!passMatch) {
      return next(new LoginError());
    }

    const token = await generateAuthToken({ id: user._id, email: user.email });
    return res.status(200).json({ user, token, success: true });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const otpController = async (req, res, next) => {
  const { userId, otp, otpId } = req.body;
  try {
    const user = await UserModel.findById(userId);
    const userOtp = await OtpModel.findById(otpId);

    if (!userOtp) {
      return next(new ValidationError("Invalid Otp"));
    }

    if (userOtp?.otp === otp) {
      user.isVerified = true;
      await user.save();
      return res.status(200).json({ user });
    }
    return next(new ValidationError("Invalid Otp"));
  } catch (error) {    
    return next(new InternalServerError());
  }
};
