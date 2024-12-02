import HomeownerSettingModel from "../model/homeowner.settings.model.js";
import { BusinessLogicError, InternalServerError } from "../error/AppError.js";
import EventsModel from "../model/events.model.js";
import AccountModel from "../model/account.model.js";
import HomeownerProfileModel from "../model/homeowner.profile.model.js";

export const settings = async (req, res, next) => {
  const userId = req.user._id;
  const role = req.user.role;

  if (role !== "homeowner") {
    return next(new BusinessLogicError());
  }

  try {
    const updateSettings = await HomeownerSettingModel.findOneAndUpdate(
      { user: userId },
      req.body,
      { new: true }
    );

    if (updateSettings) {
      return res.status(200).json({
        success: true,
        message: "settings updated",
        settings: updateSettings,
      });
    }

    const userSettings = new HomeownerSettingModel({
      user: userId,
      ...req.body,
    });
    await userSettings.save();
    return res.status(200).json({
      success: true,
      message: "settings updated ",
      settings: userSettings,
    });
  } catch (error) {
    return next(new InternalServerError("can't update settings"));
  }
};

export const getSettings = async (req, res) => {
  const userId = req.user._id;
  try {
    const settings = await HomeownerSettingModel.findOne({ user: userId });
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return next(new InternalServerError("can't get settings"));
  }
};

export const getContractors = async (_req, res, next) => {
  try {
    const contractors = await AccountModel.find({ role: "contractor" })
      .populate({
        path: "profile",
        select: "label rating services expertise experience",
      })
      .select("username avatarUrl profile profileType");
    const total = await AccountModel.countDocuments({ role: "contractor" });
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

export const getHomeMaintenanceReminders = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const reminders = await EventsModel.find({ user: userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, reminders });
  } catch (error) {
    return next(new InternalServerError("can't get reminders"));
  }
};

export const updateHomeownerProfile = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const homeownerProfile = await HomeownerProfileModel.findOneAndUpdate(
      { user: userId },
      req.body,
      { new: true, upsert: true }
    );

    await AccountModel.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          profileType: "HomeownerProfile",
          profile: homeownerProfile._id,
        },
      }
    );

    return res.status(200).json({
      success: true,
      homeownerProfile,
      message: "profile updated",
    });
  } catch (error) {
    return next(new InternalServerError("can't update profile"));
  }
};
