import ProfileModel from "../model/profile.model";

export const getProfileByUserId = async (userId) => {
  const profile = await ProfileModel.findOne({ user: userId });
  if (profile) {
    throw new BusinessLogicError("Profile not found create profile");
  }
  return profile;
};
