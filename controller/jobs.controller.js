import {
  Feedback_DIRECTORY,
  JOB_DIRECTORY,
} from "../constants/directory.constants.js";
import {
  BusinessLogicError,
  FileUploadError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../error/AppError.js";
import JobModel from "../model/job.model.js";
import JobInviteModel from "../model/job.invite.model.js";
import { uploadFile } from "../services/upload.files.media.service.js";
import { validateJobFields } from "../validators/jobs-validator.js";
import { deleteFilesFromCloudinary } from "../utils/cloudinary.delete.files.js";
import FeedbackModel from "../model/feedback.model.js";
import AccountModel from "../model/account.model.js";

export const createJob = async (req, res, next) => {
  const files = req.files;
  if (req.user.role !== "homeowner") {
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
    console.log(error);

    return next(new InternalServerError());
  }
};

export const editJob = async (req, res, next) => {
  try {
    if (req.user.role !== "homeowner") {
      return next(new BusinessLogicError());
    }

    const { media: mediaBody, deletedFiles } = req.body;
    const files = req.files;

    // if (!files?.length && !mediaBody) {
    //   throw new FileUploadError("At least one video or image is required!");
    // }

    const media = JSON.parse(mediaBody || "[]");
    const deleteMedia = JSON.parse(deletedFiles || "[]");

    const mediaUrls = await Promise.all(
      files?.map((file) => uploadFile(file, JOB_DIRECTORY)) || []
    );

    const allMedia = media.filter((m) => !deleteMedia.includes(m));
    const updatedMedia = [...mediaUrls, ...allMedia];

    const updatedData = { ...req.body, media: updatedMedia };

    const jobUpdated = await JobModel.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    await deleteFilesFromCloudinary(deleteMedia);

    return res.status(200).json({
      jobUpdated,
      success: true,
      message: "Job has been updated!",
    });
  } catch (error) {
    console.error(error);
    return next(new InternalServerError());
  }
};

export const getAllJobs = async (_req, res, next) => {
  try {
    const total = await JobModel.countDocuments({ bidStatus: "open" });
    const jobs = await JobModel.find({ bidStatus: "open" }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, total, jobs });
  } catch (error) {
    return next(
      new InternalServerError("An error occurred while fetching jobs")
    );
  }
};
export const findJobs = async (_req, res, next) => {
  try {
    const total = await JobModel.countDocuments({ bidStatus: "open" });
    const jobs = await JobModel.find({ bidStatus: "open" })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "bids",
        select: "contractor",
      });

    res.status(200).json({ success: true, total, jobs });
  } catch (error) {
    return next(
      new InternalServerError("An error occurred while fetching jobs")
    );
  }
};

export const getHomeownerJobs = async (req, res, next) => {
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
      {
        path: "bids",
        select: "contractor",
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
      status: { $in: ["in-progress", "completed"] },
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
    return next(new InternalServerError());
  }
};

export const deleteJob = async (req, res, next) => {
  const user = req.user;
  if (user.role !== "homeowner") return next(new UnauthorizedError());
  try {
    const jobId = req.params.id;
    const deletedJob = await JobModel.findByIdAndDelete(jobId);
    if (!deletedJob) {
      return next(new NotFoundError("Job Not Found"));
    }
    await deleteFilesFromCloudinary(deletedJob.media);
    return res
      .status(200)
      .json({ success: true, message: "Job deleted successfully", deletedJob });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const repostJob = async (req, res, next) => {
  const user = req.user;
  if (user.role !== "homeowner") return next(new UnauthorizedError());
  try {
    const jobId = req.params.id;
    const job = await JobModel.findById(jobId);
    if (!job) {
      return next(new NotFoundError("Job Not Found"));
    }
    job.bidStatus = "open";
    job.room = null;
    job.contractor = null;
    job.acceptedBid = null;
    job.status = "pending";
    await job.save();
    return res
      .status(200)
      .json({ success: true, message: "Job reposted", job });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const inviteContractorToJob = async (req, res, next) => {
  const user = req.user;
  const notificationService = req.app.get("notificationService");
  if (user.role !== "homeowner") return next(new UnauthorizedError());

  try {
    const jobId = req.params.id;
    const job = await JobModel.findById(jobId);
    if (!job) {
      return next(new NotFoundError("Job Not Found"));
    }

    const existInvite = await JobInviteModel.findOne({
      homeowner: user._id,
      job: jobId,
      contractor: req.body.contractor,
    });
    if (existInvite) {
      return next(
        new BusinessLogicError(
          "You have already invited this contractor to this job."
        )
      );
    }

    const jobInvite = await JobInviteModel.create({
      homeowner: user._id,
      job: jobId,
      contractor: req.body.contractor,
    });

    await notificationService.sendNotification({
      recipientId: req.body.contractor,
      recipientType: "Contractor",
      senderId: user._id,
      senderType: "Homeowner",
      message: `You have been invited to bid on ${job.title} by ${user.username}`,
      type: "bidStatus",
      url: `/contractor/project-detail/${jobId}`,
    });

    return res
      .status(200)
      .json({ success: true, message: "Contractor invited", jobInvite });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const markJobComplete = async (req, res, next) => {
  const jobId = req.params.id;

  try {
    const job = await JobModel.findByIdAndUpdate(
      jobId,
      {
        status: "completed",
      },
      { new: true }
    ).populate([
      {
        path: "acceptedBid",
        select: "bidTransaction contractor",
        populate: {
          path: "bidTransaction",
          select: "status",
        },
      },
      {
        path: "bids",
        select: "contractor",
      },
    ]);

    return res
      .status(200)
      .json({ success: true, job, message: "Job mark completed" });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const jobFeedback = async (req, res, next) => {
  const userId = req.user._id;
  const files = req.files;
  const notificationService = req.app.get("notificationService");

  const { message, contractor, jobId, rating, jobTitle } = req.body;
  if (!message && !contractor && !jobId && !files && !rating && !jobTitle) {
    return next(new ValidationError("all fields are required"));
  }
  try {
    const contractorAccount = await AccountModel.findById(contractor).populate(
      "profile"
    );

    const profile = contractorAccount.profile;
    const feedbackLength = await FeedbackModel.countDocuments({ contractor });
    const newRating =
      (profile.rating * feedbackLength + Number(rating)) / (feedbackLength + 1);
    profile.rating = newRating;
    await profile.save();

    let mediaUrl = [];
    for (const file of files) {
      const fileRes = await uploadFile(file, Feedback_DIRECTORY);
      mediaUrl.push(fileRes);
    }
    const data = {
      message,
      contractor,
      homeowner: userId,
      job: jobId,
      media: mediaUrl,
      rating,
    };
    const feedback = await FeedbackModel.create(data);
    await notificationService.sendNotification({
      recipientId: contractor,
      recipientType: "Contractor",
      senderId: userId,
      senderType: "Homeowner",
      message: `Homeowner ${req.user.username} leave a feedback on job ${jobTitle} `,
      type: "Feedback",
      url: `/contractor/project-detail/${jobId}`,
    });
    return res
      .status(200)
      .json({ success: true, feedback, message: "feedback submitted" });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const getHomeownerJobFeedback = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const feedbacks = await FeedbackModel.find({
      homeowner: userId,
    })
      .populate([
        { path: "contractor", select: "username" },
        {
          path: "job",
          select: "title",
        },
      ])
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      feedbacks,
    });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const getContractorJobFeedback = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const feedbacks = await FeedbackModel.find({
      contractor: userId,
    })
      .populate([
        { path: "contractor", select: "username avatarUrl" },
        {
          path: "job",
          select: "title",
        },
      ])
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      feedbacks,
    });
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const requestFeedback = async (req, res, next) => {
  const userId = req.user._id;
  const notificationService = req.app.get("notificationService");
  const { jobId, homeownerId, jobTitle } = req.body;
  try {
    await notificationService.sendNotification({
      recipientId: homeownerId,
      recipientType: "Homeowner",
      senderId: userId,
      senderType: "Contractor",
      message: `Contractor ${req.user.username} request feedback on job ${jobTitle} `,
      type: "Feedback",
      url: `/home-owner/project-detail/${jobId}`,
    });
    return res
      .status(200)
      .json({ message: "Feedback request sent", success: true });
  } catch (error) {
    console.log(error);

    return next(new InternalServerError());
  }
};

export const editJobFeedback = async (req, res, next) => {
  const feedbackId = req.params.id;
  const { removedFiles, oldMedia, contractorId, message, rating } = req.body;
  const parsedOldMedia = JSON.parse(oldMedia || "[]");
  const parsedRemovedFiles = JSON.parse(removedFiles || "[]");
  let allMedia = [];
  try {
    allMedia = parsedOldMedia.filter(
      (media) => !parsedRemovedFiles.includes(media)
    );
    const contractorAccount = await AccountModel.findById(
      contractorId
    ).populate("profile");

    for (const file of req.files) {
      const fileRes = await uploadFile(file, Feedback_DIRECTORY);
      allMedia.push(fileRes);
    }
    if (parsedRemovedFiles) {
      await deleteFilesFromCloudinary(parsedRemovedFiles);
    }

    const newFeedback = await FeedbackModel.findByIdAndUpdate(
      feedbackId,
      {
        message,
        rating: Number(rating),
        media: allMedia,
      },
      { new: true }
    );

    const profile = contractorAccount.profile;
    const feedbackLength = await FeedbackModel.countDocuments({
      contractor: contractorId,
    });
    const newRating =
      (profile.rating * feedbackLength + Number(rating)) / (feedbackLength + 1);
    profile.rating = newRating;
    await profile.save();
    return res
      .status(200)
      .json({ success: true, message: "Feedback updated", newFeedback });
  } catch (error) {
    console.log(error);
    return next(new InternalServerError());
  }
};

export const deleteFeedbackJobById = async (req, res, next) => {
  const feedbackId = req.params.id;
  try {
    const feedback = await FeedbackModel.findByIdAndDelete(feedbackId);
    if (!feedback) {
      return next(new NotFoundError("Feedback not found"));
    }
    await deleteFilesFromCloudinary(feedback.media);
    return res
      .status(200)
      .json({ success: true, message: "Feedback deleted", feedback });
  } catch (error) {
    return next(new InternalServerError());
  }
};
