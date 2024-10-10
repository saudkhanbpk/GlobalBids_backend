import BidModel from "../model/bids.model.js";
import {
  BusinessLogicError,
  FileUploadError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "../error/AppError.js";
import ProjectModel from "../model/project.model.js";
import NotificationModel from "../model/notification.model.js";
import { connectedUsers } from "../event/site-events.js";
import Job from "../model/job.model.js";
import { validateBidFields } from "../validators/bid-validators.js";
import { uploadFile } from "../services/upload.file.service.js";
import Contractor from "../model/user.contractor.model.js";
import Homeowner from "../model/user.homeOwner.model.js";

export const createBid = async (req, res, next) => {
  const io = req.app.get("io");

  const data = req.body;
  const files = req.files;
  let attachments = [];

  try {
    const job = await Job.findOne({ _id: req.body.jobId });
    if (!job) {
      return next(new NotFoundError("Job not found."));
    }
    if (job.bidStatus === "closed") {
      return next(new BusinessLogicError("Bids are closed for this job!"));
    }

    const existingBid = await BidModel.findOne({
      owner: req.body.ownerId,
      contractor: req.body.contractorId,
      jobId: req.body.jobId,
    });

    if (existingBid) {
      return next(
        new BusinessLogicError("You have already submitted a bid for this job.")
      );
    }
  } catch (error) {
    return next(
      new InternalServerError("Failed to create bid. Please try again later.")
    );
  }

  try {
    for (const file of files) {
      const fileUrl = await uploadFile(file, "bids");
      attachments.push(fileUrl);
    }
  } catch (error) {
    return next(new FileUploadError());
  }

  try {
    const validateFields = validateBidFields({
      ...data,
      stages: JSON.parse(data.stages),
    });

    if (validateFields) {
      return next(new ValidationError(JSON.stringify(validateFields)));
    }

    const comments = [
      {
        user: data.contractorId,
        comment: req.body.comment,
        userType: "Contractor",
      },
    ];

    const newBid = new BidModel({
      amount: data.amount,
      bidBreakdown: data.bidBreakdown,
      owner: data.ownerId,
      contractor: data.contractorId,
      jobId: data.jobId,
      stages: JSON.parse(data.stages),
      comments,
      attachments: attachments,
    });

    const savedBid = await newBid.save();

    const notification = new NotificationModel({
      recipientId: newBid.owner,
      recipient: "Homeowner",
      senderId: newBid.contractor,
      senderModel: "Contractor",
      message: `New bid submitted by contractor for Job ${req.body.jobTitle}`,
      type: "bid",
      url: `/home-owner/jobs/job-details/${req.body.jobId}`,
    });

    await notification.save();

    io.to(connectedUsers[newBid.owner]).emit("notification", notification);

    return res.status(201).json({
      success: true,
      message: "Bid submitted successfully.",
      bid: savedBid,
    });
  } catch (error) {
    return next(
      new InternalServerError("Failed to create bid. Please try again later.")
    );
  }
};

export const getOwnerBids = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const bids = await BidModel.find({
      owner: ownerId,
      status: "pending",
    })
      .populate({
        path: "contractor",
        select: "username imageUrl label",
      })
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, bids });
  } catch (error) {
    return next(
      new InternalServerError(
        "Failed to fetch owner bids Please try again later."
      )
    );
  }
};

export const getContractorBids = async (req, res, next) => {
  try {
    const contractor = req.user._id;
    const bids = await BidModel.find({ contractor })
      .populate({
        path: "jobId",
        select: "title",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, bids });
  } catch (error) {
    return next(
      new InternalServerError(
        "Failed to fetch contractor bids. Please try again later."
      )
    );
  }
};

export const changeBidStatus = async (req, res, next) => {
  const user = req.user;

  if (user.role !== "owner") {
    return next(new BusinessLogicError());
  }

  const { bidId, job, contractor } = req.body;

  try {
    const bid = await BidModel.findOne({
      _id: bidId,
      status: "pending",
    }).populate("jobId");
    if (!bid) {
      return next(new NotFoundError("bid not found!"));
    }

    const job = await Job.findById(bid.jobId._id);
    job.job = "closed";
    await job.save();
    bid.status = job;

    if (bid.status === "accepted") {
      const newProject = new ProjectModel({
        contractor,
        title: bid.jobId.title,
        owner: user._id,
        jobId: bid.jobId._id,
        images: [bid.jobId.file],
        totalBudget: bid.jobId.budget,
      });
      await newProject.save();
    }

    await bid.save();

    return res
      .status(200)
      .json({ success: true, message: `Bid is ${job}`, bid });
  } catch (error) {
    return next(new InternalServerError("bid status can't be change"));
  }
};

export const getBid = async (req, res, next) => {
  const { id } = req.params;

  try {
    const bid = await BidModel.findById(id).populate({
      path: "contractor",
      select: "username imageUrl label",
    });

    return res.status(200).json({ success: true, bid });
  } catch (error) {
    return next(new InternalServerError("Failed to fetch the bid"));
  }
};
