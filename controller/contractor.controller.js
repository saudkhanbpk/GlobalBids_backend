import { InternalServerError } from "../error/AppError.js";
import ContractorSettingsModel from "../model/contractor.settings.model.js";

export const contractorSettings = async (req, res, next) => {
  const userId = req.user._id;
  const role = req.user.role;

  if (role !== "contractor") {
    return next(new BusinessLogicError());
  }

  try {
    const updateSettings = await ContractorSettingsModel.findOneAndUpdate(
      { user: userId },
      req.body,
      { new: true }
    );

    if (updateSettings) {
      return res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        settings: updateSettings,
      });
    }

    const newSettings = new ContractorSettingsModel({
      user: userId,
      ...req.boy,
    });

    await newSettings.save();

    return res.status(200).json({
      success: true,
      message: "Settings created successfully",
      settings: newSettings,
    });
  } catch (error) {
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
