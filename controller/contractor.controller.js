import { BusinessLogicError, InternalServerError } from "../error/AppError.js";
import AccountModel from "../model/account.model.js";
import ContractorProfileModel from "../model/contractor.profile.model.js";
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
      { new: true, upsert: true }
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

export const updateContractorProfile = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const contractorProfile = await ContractorProfileModel.findOneAndUpdate(
      { user: userId },
      req.body,
      { new: true, upsert: true }
    );
    await AccountModel.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          profileType: "ContractorProfile",
          profile: contractorProfile._id,
        },
      }
    );
    return res.status(200).json({
      success: true,
      contractorProfile,
      message: "profile updated",
    });
  } catch (error) {
    return next(new InternalServerError("can't update profile"));
  }
};

export const deleteContractorServiceById = async (req, res, next) => {
  const contractorId = req.user._id;
  const { id: serviceId } = req.params;

  try {
    const contractor = await ContractorProfileModel.findOneAndUpdate(
      { user: contractorId },
      { $pull: { pageServices: { _id: serviceId } } },
      { new: true }
    );

    if (!contractor) {
      return res
        .status(404)
        .json({ success: false, message: "Contractor not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
      pageServices: contractor.pageServices,
    });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const getContractorPage = async (req, res, next) => {
  const { id } = req.params;

  try {
    const contractorPage = await AccountModel.findOne({
      _id: id,
    })
      .select("username  avatarUrl coverPhoto rating profile profileType")
      .populate({ path: "profile", select: "pageServices about experience portfolioMedia" });
    return res.status(200).json({ success: true, contractorPage });
  } catch (error) {
    return next(new InternalServerError());
  }
};
