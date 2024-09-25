import { JOB_DIRECTORY } from "../constants/dirctory.constants.js";
import {
  BusinessLogicError,
  FileUploadError,
  InternalServerError,
  ValidationError,
} from "../error/AppError.js";
import JobModel from "../model/job.model.js";
import { uploadFile } from "../services/upload.file.service.js";
import { validateJobFields } from "../validators/jobs-validator.js";

export const createJob = async (req, res, next) => {
  const file = req.file;

  if (req.user.role !== "owner") {
    return next(new BusinessLogicError());
  }

  if (!file) {
    return next(new FileUploadError("file is required!"));
  }

  const validate = validateJobFields(req.body);
  if (validate) {
    return next(new ValidationError(JSON.stringify(validate)));
  }

  let fileUrl = "";
  try {
    const fileRes = await uploadFile(file, JOB_DIRECTORY);
    fileUrl = fileRes;
  } catch (error) {
    console.log(error);

    return next(new FileUploadError());
  }
  try {
    const job = new JobModel({
      user: req.user._id,
      ...req.body,
      file: fileUrl,
    });

    const savedJob = await job.save();
    res
      .status(201)
      .json({ success: true, message: "job has been created!", job: savedJob });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const getAllJobs = async (_req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const total = await JobModel.countDocuments();

    const jobs = await JobModel.find({ createdAt: { $gt: thirtyDaysAgo } })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, total, jobs });
  } catch (error) {
    return next(
      new InternalServerError("An error occurred while fetching jobs")
    );
  }
};

export const getAllContractorJobs = (req, res, next) => {};
