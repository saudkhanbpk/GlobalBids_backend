import { JOB_DIRECTORY } from "../constants/directory.constants.js";
import {
  BusinessLogicError,
  FileUploadError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "../error/AppError.js";
import JobModel from "../model/job.model.js";
import { uploadFile } from "../services/upload.files.media.service.js";
import { validateJobFields } from "../validators/jobs-validator.js";

export const createJob = async (req, res, next) => {
  const files = req.files;
  if (req.user.role !== "user") {
    return next(new BusinessLogicError());
  }

  if (!files) {
    return next(
      new FileUploadError("At least one video or image is required!")
    );
  }

  const validate = validateJobFields(req.body);
  if (validate) {
    return next(new ValidationError(JSON.stringify(validate)));
  }

  let mediaUrls = [];
  try {
    for (const file of files) {
      const fileRes = await uploadFile(file, JOB_DIRECTORY);
      mediaUrls.push(fileRes);
    }
  } catch (error) {
    return next(new FileUploadError());
  }

  try {
    const { stages, ...rest } = req.body;
    const jobData = {
      user: req.user._id,
      media: mediaUrls,
      ...rest,
      status: "pending",
      progress: "0",
    };

    const job = new JobModel(jobData);
    const savedJob = await job.save();
    res.status(201).json({
      success: true,
      message: "Job has been created!",
      job: savedJob,
    });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const getAllJobs = async (_req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const total = await JobModel.countDocuments();
    // const jobs = await JobModel.find({ createdAt: { $gt: thirtyDaysAgo } })
    const jobs = await JobModel.find().sort({ createdAt: -1 }).limit(50);

    res.status(200).json({ success: true, total, jobs });
  } catch (error) {
    return next(
      new InternalServerError("An error occurred while fetching jobs")
    );
  }
};

export const getUserJobs = async (req, res, next) => {
  const id = req.user._id;
  try {
    const jobs = await JobModel.find({ user: id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, jobs });
  } catch (error) {
    return next(new InternalServerError("can't get jobs"));
  }
};

export const getJobDetails = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const jobDetails = await JobModel.findById(jobId);

    if (!jobDetails) {
      return next(new NotFoundError());
    }
    return res.status(200).json({ success: true, job: jobDetails });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const getJobStatistics = async (req, res, next) => {
  try {
    const user = req.user._id;
    const jobStatistics = await JobModel.aggregate([
      { $match: { user: user } },
      { $match: { status: { $ne: null } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]);

    return res.status(200).json({ success: true, statistics: jobStatistics });
  } catch (error) {
    console.error("Error fetching job statistics:", error);
    return next(new InternalServerError("Failed to fetch job statistics."));
  }
};
