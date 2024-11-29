import bcrypt from "bcryptjs";
import UserContractorModel from "../model/user.contractor.model.js";
import UserHomeOwnerModel from "../model/user.homeOwner.model.js";
import { NotFoundError } from "../error/AppError.js";
// import { uploadFile } from "./upload.files.media.service.js";
// import { removeEmptyFields } from "../utils/removeEmptyFields.js";

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

export const updateHomeownerInfo = async (userId, reqData) => {
  const updateFields = {
    ...reqData,
  };

  if (reqData.password) {
    const salt = await bcrypt.genSalt(10);
    updateFields.password = await bcrypt.hash(data.password, salt);
  }
  const updatedUser = await UserHomeOwnerModel.findByIdAndUpdate(
    userId,
    updateFields,
    { new: true }
  );
  if (!updatedUser) throw new NotFoundError("User not found");

  return updatedUser;
};

export const updateContractorInfo = async (userId, reqData) => {
  try {
    const updateFields = {
      ...reqData,
    };

    const updatedUser = await UserContractorModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) throw new Error("User not found");

    return updatedUser;
  } catch (error) {
    throw new Error("Can't update user");
  }
};
