import ProfileModel from "../model/profile.model.js";

export const getProfileByUserId = async (userId) => {
  const profile = await ProfileModel.findOne({ user: userId });
  return profile;
};
