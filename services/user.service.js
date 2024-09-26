import bcrypt from "bcryptjs";
import UserContractorModel from "../model/user.contractor.model.js";
import UserHomeOwnerModel from "../model/user.homeOwner.model.js";
import { uploadProfileImage } from "./upload.image.service.js";
import { NotFoundError } from "../error/AppError.js";

export const getUserByEmail = async (email) => {
  const contractor = await UserContractorModel.findOne({ email }).select(
    "+password"
  );
  if (contractor) return contractor;

  const owner = await UserHomeOwnerModel.findOne({ email }).select("+password");
  if (owner) return owner;

  return null;
};

export const getUserById = async (id, select = null) => {
  let queryFields = select ? select : "";

  const contractor = await UserContractorModel.findById(id).select(queryFields);
  if (contractor) return contractor;

  const owner = await UserHomeOwnerModel.findById(id).select(queryFields);
  if (owner) return owner;

  return null;
};

export const updateUserVerificationStatus = async (userId) => {
  const contractor = await UserContractorModel.findById(userId);
  if (contractor) {
    contractor.isVerified = true;
    return await contractor.save();
  }

  const owner = await UserHomeOwnerModel.findById(userId);
  if (owner) {
    owner.isVerified = true;
    return await owner.save();
  }
};

export const updateHomeownerInfo = async (userId, data, file) => {
  let imageUrl = "";
  if (file) {
    imageUrl = await uploadProfileImage(file);
  }

  const user = await UserHomeOwnerModel.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.fullName = data.fullName || user.fullName;
  user.address = data.address || user.address;
  user.phone = data.phone || user.phone;

  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(data.password, salt);
  }

  if (imageUrl) {
    user.imageUrl = imageUrl;
  }

  await user.save();
  return user;
};

export const updateContractorInfo = async (userId, updateData, file) => {
  const user = await UserContractorModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (file) {
    const imageUrl = await uploadProfileImage(file);
    user.imageUrl = imageUrl;
  }

  user.fullName = updateData.fullName || user.fullName;
  user.phone = updateData.phone || user.phone;
  user.address = updateData.address || user.address;
  user.rating = updateData.rating || user.rating;
  user.label = updateData.label || user.label;
  user.licenseNumber = updateData.licenseNumber || user.licenseNumber;
  user.insuranceInformation =
    updateData.insuranceInformation || user.insuranceInformation;
  user.services = updateData.services
    ? JSON.parse(updateData.services)
    : user.services;
  user.professionalExperience = updateData.professionalExperience
    ? JSON.parse(updateData.professionalExperience)
    : user.professionalExperience;

  await user.save();
  return user;
};
