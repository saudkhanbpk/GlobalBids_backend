import UserModel from "../model/user.model.js";

export const getUserByEmail = async (email) => {
  const user = await UserModel.findByEmail(email);
  return user;
};

export const getUserById = async (id) => {
  const user = await UserModel.findById(id);
  return user;
};
