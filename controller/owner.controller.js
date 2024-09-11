import OwnerSettingModel from "../model/owner.settings.model.js";
import { BusinessLogicError, InternalServerError } from "../error/AppError.js";
import UserModel from "../model/user.model.js";

export const settings = async (req, res, next) => {
  const userId = req.user._id;
  const role = req.user.role;

  if (role !== "owner") {
    return next(new BusinessLogicError());
  }

  try {
    const existSettings = await OwnerSettingModel.findOne({ user: userId });

    if (existSettings) {
      existSettings.emailNotification =
        req.body.emailNotification !== undefined
          ? req.body.emailNotification
          : existSettings.emailNotification;

      existSettings.smsNotification =
        req.body.smsNotification !== undefined
          ? req.body.smsNotification
          : existSettings.smsNotification;

      existSettings.publicProfile =
        req.body.publicProfile !== undefined
          ? req.body.publicProfile
          : existSettings.publicProfile;

      existSettings.shareData =
        req.body.shareData !== undefined
          ? req.body.shareData
          : existSettings.shareData;

      await existSettings.save();

      return res.status(200).json({
        success: true,
        message: "settings updated successfully",
        settings: existSettings,
      });
    }

    const userSettings = new OwnerSettingModel({
      user: userId,
      ...req.body,
    });
    await userSettings.save();
    return res.status(200).json({
      success: true,
      message: "settings updated successfully",
      settings: userSettings,
    });
  } catch (error) {
    return next(new InternalServerError("can't update settings"));
  }
};

export const getSettings = async (req, res) => {
  const userId = req.user._id;
  try {
    const settings = await OwnerSettingModel.findOne({ user: userId });
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return next(new InternalServerError("can't get settings"));
  }
};

export const getContractors = async (req, res, next) => {
  try {
    const contractors = await UserModel.find({ role: "contractor" });
    const total = await UserModel.countDocuments();

    return res.status(200).json({
      success: true,
      total,
      contractors,
    });
  } catch (error) {
    console.log(error);
    
    return next(new InternalServerError());
  }
};
