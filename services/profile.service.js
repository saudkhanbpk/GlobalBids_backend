import ContractorProfileModel from "../model/contractor.profile.model.js";


export const getProfileByUserId = async (userId) => {
  const profile = await ContractorProfileModel.findOne({ user: userId })
  return profile;
};
