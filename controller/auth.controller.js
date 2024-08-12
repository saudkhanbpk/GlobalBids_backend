import UserModel from "../model/user.model.js";

export const loginController = (req, res) => {
  return res.status(200).json({ success: false });
};

export const emailCheckController = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({
      success: false,
      message: "Email is Required in order to create account",
    });

  try {
    const user = await UserModel.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "User already exist " });

    return res.status(200).json({ success: true, message: "Create account!" });
  } catch (error) {}
  return res.status(200).json({ success });
};

export const signUpController = async (req, res) => {
  const {
    email,
    firsName,
    lastName,
    workRole,
    country,
    sendSms,
    termsOfServices,
    password,
  } = req.body;

  if (
    !(email,
    firsName &&
      lastName &&
      workRole &&
      country &&
      sendSms &&
      termsOfServices &&
      password)
  )
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });

  try {
    
  } catch (error) {}
};
