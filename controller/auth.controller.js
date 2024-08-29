import UserModel from "../model/user.model.js";
import {
  ValidationError,
  InternalServerError,
  LoginError,
} from "../error/AppError.js";
import { EmailValidationError } from "../error/validatorsErrors.js";
import generateAuthToken from "../utils/generte-auth-token.js";
import { getUserByEmail } from "../services/user.service.js";
import { validateEmail } from "../validators/email-validate.js";
import { signUpValidate } from "../validators/sign-up-validators.js";

export const signUpController = async (req, res, next) => {
  const userData = req.body;

  const validateData = signUpValidate(userData);

  if (validateData) {
    return next(new ValidationError(JSON.stringify(validateData)));
  }

  try {
    const user = new UserModel(userData);

    const newUser = await user.save();
    const token = await generateAuthToken({
      id: newUser._id,
      email: newUser.email,
    });
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: newUser,
      token,
    });
  } catch (error) {
    console.log(error);

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
