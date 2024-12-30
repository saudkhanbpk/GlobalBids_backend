import { BusinessLogicError, InternalServerError } from "../error/AppError.js";
import AccountModel from "../model/account.model.js";
import ContractorProfileModel from "../model/contractor.profile.model.js";
import ContractorSettingsModel from "../model/contractor.settings.model.js";
import WeeklyScheduleModel from "../model/contractor.weekly.schedule.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const contractorSettings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  if (role !== "contractor") {
    throw new BusinessLogicError();
  }

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
});

export const getContractorSettings = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const settings = await ContractorSettingsModel.findOne({
    user: userId,
  });
  return res.status(200).json({
    success: true,
    settings,
  });
});

export const updateContractorProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

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
});

export const deleteContractorServiceById = asyncHandler(async (req, res) => {
  const contractorId = req.user._id;
  const { id: serviceId } = req.params;

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
});

export const getContractorPage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const contractorPage = await AccountModel.findOne({
    _id: id,
  })
    .select("username  avatarUrl coverPhoto rating profile profileType rating")
    .populate({
      path: "profile",
      model: "ContractorProfile",
      select:
        "pageServices services about experience portfolioMedia weeklySchedule rating",
      populate: "weeklySchedule",
    });
  return res.status(200).json({ success: true, contractorPage });
});

export const weeklySchedule = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const data = req.body;

  const weeklySchedule = await WeeklyScheduleModel.findOneAndUpdate(
    { account: userId },
    { $set: data },
    { new: true, upsert: true, runValidators: true }
  );
  await ContractorProfileModel.findOneAndUpdate(
    {
      user: userId,
    },
    {
      weeklySchedule: weeklySchedule._id,
    }
  );
  res.status(200).json({
    success: true,
    message: "Weekly schedule updated successfully",
    data: weeklySchedule,
  });
});
