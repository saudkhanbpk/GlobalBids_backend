import { InternalServerError } from "../error/AppError.js";
import ProjectModel from "../model/project.model.js";

export const getOwnerProjects = async (req, res, next) => {
  const user = req.user;
  try {
    const projects = await ProjectModel.find({ owner: user._id }).sort({
      createdAt: -1,
    });
    return res.status(201).json({ success: true, projects });
  } catch (error) {
    return next(new InternalServerError("No projects found"));
  }
};

export const getOwnerCurrentProjects = async (req, res, next) => {
  const user = req.user;
  try {
    const projects = await ProjectModel.find({ owner: user._id }).populate({
      path:"contractor",
      select:"username"
    })
      .sort({
        createdAt: -1,
      })
      .limit(2);
    return res.status(201).json({ success: true, projects });
  } catch (error) {
    return next(new InternalServerError("No projects found"));
  }
};
