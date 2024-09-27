import { InternalServerError } from "../error/AppError.js";
import ContractorSettingsModel from "../model/contractor.settings.model.js";

export const contractorSettings = async (req, res, next) => {
  const userId = req.user._id;
  const role = req.user.role;

  if (role !== "contractor") {
    return next(new BusinessLogicError());
  }

  try {
    const existingSettings = await ContractorSettingsModel.findOne({
      user: userId,
    });

    if (existingSettings) {
      existingSettings.notifications =
        req.body.notifications || existingSettings.notifications;

      existingSettings.profileVisibility =
        req.body.profileVisibility || existingSettings.profileVisibility;

      await existingSettings.save();

      return res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        settings: existingSettings,
      });
    }

    const newSettings = new ContractorSettingsModel({
      user: userId,
      notifications: req.body.notifications,
      profileVisibility: req.body.profileVisibility,
    });

    await newSettings.save();

    return res.status(200).json({
      success: true,
      message: "Settings created successfully",
      settings: newSettings,
    });
  } catch (error) {
    console.error(error);
    return next(new InternalServerError("Failed to update settings"));
  }
};

export const getContractorSettings = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const settings = await ContractorSettingsModel.findOne({
      user: userId,
    });
    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    return next(new InternalServerError(""));
  }
};
