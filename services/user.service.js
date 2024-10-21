import bcrypt from "bcryptjs";
import UserContractorModel from "../model/user.contractor.model.js";
import UserHomeOwnerModel from "../model/user.homeOwner.model.js";

import { NotFoundError } from "../error/AppError.js";
import { uploadFile } from "./upload.files.media.service.js";

export const getUserByEmail = async (email, select = "+password") => {
  const contractor = await UserContractorModel.findOne({ email }).select(
    select
  );
  if (contractor) return contractor;

  const owner = await UserHomeOwnerModel.findOne({ email }).select(select);
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

export const updateHomeownerInfo = async (userId, reqData, files) => {
  const data = JSON.parse(reqData.payload);
  const user = await UserHomeOwnerModel.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (files?.profilePic) {
    const fileUrl = await uploadFile(
      files.profilePic[0],
      "contractor-profile-images"
    );
    user.imageUrl = fileUrl;
  }

  user.personalInformation =
    data.personalInformation || user.personalInformation;
  user.propertyDetails = data.propertyDetails || user.propertyDetails;
  user.projectNeeds = data.projectNeeds || user.projectNeeds;
  user.specificArea = data.specificArea || user.specificArea;
  user.contractorPreferences =
    data.contractorPreferences || user.contractorPreferences;
  user.additionalInformation =
    data.additionalInformation || user.additionalInformation;
  user.email = data.email || user.email;
  user.phone = data.phone || user.phone;
  user.fullName = data.fullName || user.fullName;

  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(data.password, salt);
  }

  await user.save();
  return user;
};

export const updateContractorInfo = async (userId, reqData, files) => {
  const data = JSON.parse(reqData.payload);
  const user = await UserContractorModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.company = { file: user.company.file, ...data.company } || user.company;
  user.insurance =
    { file: user?.insurance?.file, ...data.insurance } || user.insurance;
  user.business = data.business || user.business;
  user.services = data.services || user.services;
  user.experience = data.experience || user.experience;
  user.expertise = data.expertise || user.expertise;
  user.onlinePresence = data.onlinePresence || user.onlinePresence;

  if (files?.insuranceFile) {
    const fileUrl = await uploadFile(
      files.insuranceFile[0],
      "contractor-company-files"
    );
    user.insurance.file = fileUrl;
  }

  if (files?.compensationFile) {
    const fileUrl = await uploadFile(
      files.compensationFile[0],
      "contractor-company-files"
    );
    console.log(fileUrl);

    user.company.file = fileUrl;
  }

  if (files?.profilePic) {
    const fileUrl = await uploadFile(
      files.profilePic[0],
      "contractor-profile-images"
    );
    user.imageUrl = fileUrl;
  }

  await user.save();
  return user;
};
