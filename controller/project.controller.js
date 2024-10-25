import { InternalServerError } from "../error/AppError.js";
import ProjectModel from "../model/project.model.js";
import { uploadFile } from "../services/upload.files.media.service.js";

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
    const projects = await ProjectModel.find({ owner: id })
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

export const updateProject = async (req, res, next) => {
  const { id } = req.params;
  const files = req.files;
  const data = req.body;
  const media = [];

  try {
    if (files) {
      for (const file of files) {
        const url = await uploadFile(file, "projects");
        media.push(url);
      }
    }

    const project = await ProjectModel.findById(id);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    const updatedImages = [...project.images, ...media];

    const updatedProject = await ProjectModel.findByIdAndUpdate(
      id,
      { ...data, images: updatedImages },
      { new: true }
    );

    return res.status(200).json({ success: true, project: updatedProject });
  } catch (error) {
    console.log(error);
    return next(new InternalServerError());
  }
};
