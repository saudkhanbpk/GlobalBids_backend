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
import { extractPublicId } from "../utils/cloudinary.utils.js";
import cloudinary from "../config/cloudinary.config.js";
export const createJob = async (req, res, next) => {
  const files = req.files;
  if (req.user.role !== "owner") {
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
    const { ...rest } = req.body;
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

export const editJob = async (req, res, next) => {
  const files = req.files;
  if (req.user.role !== "owner") {
    return next(new BusinessLogicError());
  }

  if (!files && !req.body.media) {
    return next(
      new FileUploadError("At least one video or image is required!")
    );
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

  const media = JSON.parse(req.body.media);
  const deleteMedia = JSON.parse(req.body.deletedFiles);

  const allMedia = media.filter((m) => !deleteMedia.includes(m));

  const updatedData = { ...req.body, media: [...mediaUrls, ...allMedia] };
  try {
    const jobUpdated = await JobModel.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    const deletionPromises = deleteMedia.map(async (fileUrl) => {
      try {
        const publicId = extractPublicId(fileUrl);
        const result = await cloudinary.uploader.destroy(publicId);
        console.log(publicId, result);
      } catch (err) {
        console.error(`Failed to delete file: ${fileUrl}`, err);
      }
    });

    await Promise.all(deletionPromises);

    return res
      .status(200)
      .json({ jobUpdated, success: true, message: "Job has been updated!" });
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
    const jobs = await JobModel.find({ user: id })
      .populate({
        path: "contractor",
        select: "username",
      })
      .sort({ createdAt: -1 });
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

export const getJob = async (req, res, next) => {
  // const popUser = req.user.role === "contractor" ? "user" : "contractor";
  try {
    const jobId = req.params.id;
    const job = await JobModel.findById(jobId).populate([
      {
        path: "acceptedBid",
        select: "bidTransaction contractor",
        populate: {
          path: "bidTransaction",
          select: "status",
        },
      },
    ]);

    if (!job) {
      return next(new NotFoundError("Job not found"));
    }
    return res.status(200).json({ success: true, job });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const getContractorJobs = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const jobs = await JobModel.find({
      contractor: userId,
      status: "in-progress",
    }).populate([
      {
        path: "user",
        select: "username address email phone",
      },
      {
        path: "acceptedBid",
      },
    ]);

    if (!jobs) {
      return next(new NotFoundError("Jobs not found!"));
    }

    return res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error(error);
    return next(new InternalServerError());
  }
};
