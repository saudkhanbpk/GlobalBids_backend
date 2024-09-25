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

export const getProjectsInProgress = async (req, res, next) => {
  const id = req.user._id;

  try {
    const projects = await ProjectModel.find({
      $and: [
        { $or: [{ contractor: id }, { owner: id }] },
        {
          $or: [{ status: { $ne: "completed" } }, { progress: { $lt: "100" } }],
        },
      ],
    })
      .populate("contractor", "username")
      .populate("owner", "username");

    return res.status(200).json({ success: true, projects });
  } catch (error) {
    return next(new InternalServerError("can't get work in progress"));
  }
};

export const getAllContractorProjects = async (req, res, next) => {
  const id = req.user._id;
  try {
    const projects = await ProjectModel.find({ contractor: id });
    return res.status(200).json({ success: true, projects });
  } catch (error) {
    return next(new InternalServerError());
  }
};
