import bcrypt from "bcryptjs";
import UserContractorModel from "../model/user.contractor.model.js";
import UserHomeOwnerModel from "../model/user.homeOwner.model.js";
import { NotFoundError } from "../error/AppError.js";
import { uploadFile } from "./upload.files.media.service.js";
import { removeEmptyFields } from "../utils/removeEmptyFields.js";

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
  const updateFields = {
    ...data,
    ...(files?.profilePic && {
      imageUrl: await uploadFile(
        files.profilePic[0],
        "contractor-profile-images"
      ),
    }),
  };

  if (data.password) {
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

export const updateContractorInfo = async (userId, reqData, files) => {
  const data = JSON.parse(reqData.payload);

  const updateFields = {
    ...data,
    ...(data.company && { company: { ...data.company } }),
    ...(data.insurance && { insurance: { ...data.insurance } }),
  };

  if (files?.insuranceFile) {
    const uploadedFileUrl = await uploadFile(
      files.insuranceFile[0],
      "contractor-company-files"
    );
    updateFields.insurance = {
      ...updateFields.insurance,
      file: uploadedFileUrl,
    };
  }

  if (files?.compensationFile) {
    const uploadedFileUrl = await uploadFile(
      files.compensationFile[0],
      "contractor-company-files"
    );

    updateFields.company = {
      ...updateFields.company,
      file: uploadedFileUrl,
    };
  }

  if (files?.profilePic) {
    const uploadedFileUrl = await uploadFile(
      files.profilePic[0],
      "profile-images"
    );
    updateFields.imageUrl = uploadedFileUrl;
  }

  const updatedUser = await UserContractorModel.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true }
  );
  if (!updatedUser) throw new Error("User not found");

  return updatedUser;
};
