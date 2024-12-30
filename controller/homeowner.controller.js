import HomeownerSettingModel from "../model/homeowner.settings.model.js";
import { BusinessLogicError, InternalServerError } from "../error/AppError.js";
import EventsModel from "../model/events.model.js";
import AccountModel from "../model/account.model.js";
import HomeownerProfileModel from "../model/homeowner.profile.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const settings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  if (role !== "homeowner") {
    throw new BusinessLogicError();
  }

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
});

export const getSettings = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const settings = await HomeownerSettingModel.findOne({ user: userId });
  return res.status(200).json({ success: true, settings });
});

export const getContractors = asyncHandler(async (_req, res) => {
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
});

export const getHomeMaintenanceReminders = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const reminders = await EventsModel.find({ user: userId }).sort({
    createdAt: -1,
  });
  return res.status(200).json({ success: true, reminders });
});

export const updateHomeownerProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

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
});
