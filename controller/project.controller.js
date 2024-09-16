import { InternalServerError } from "../error/AppError.js";
import OwnerProjectModel from "../model/ownerProject.model.js";

export const getOwnerProjects = async (req, res, next) => {
  const user = req.user;
  try {
    const projects = await OwnerProjectModel.find({ owner: user._id });
    return res.status(201).json({ success: true, projects });
  } catch (error) {
    return next(new InternalServerError("No projects found"));
  }
};
