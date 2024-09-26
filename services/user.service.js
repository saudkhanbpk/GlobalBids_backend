import UserContractorModel from "../model/user.contractor.model.js";
import UserHomeOwnerModel from "../model/user.homeOwner.model.js";

export const getUserByEmail = async (email) => {
  const contractor = await UserContractorModel.findOne({ email }).select(
    "+password"
  );
  if (contractor) return contractor;

  const owner = await UserHomeOwnerModel.findOne({ email }).select("+password");
  if (owner) return owner;

  return null;
};

export const getUserById = async (id) => {
  const contractor = await UserContractorModel.findById(id);
  if (contractor) return contractor;

  const owner = await UserHomeOwnerModel.findById(id);
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
