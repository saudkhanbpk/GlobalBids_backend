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
import { uploadFile } from "../services/upload.files.media.service.js";

export const createBid = async (req, res, next) => {
  const notificationService = req.app.get("notificationService");

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
    const validateFields = validateBidFields(data);

    if (validateFields) {
      return next(new ValidationError(JSON.stringify(validateFields)));
    }

    const newBid = new BidModel({
      amount: data.amount,
      bidBreakdown: data.bidBreakdown,
      owner: data.ownerId,
      contractor: data.contractorId,
      jobId: data.jobId,
      comment: data.comment,
      startDate: data.startDate,
      projectDuration: data.projectDuration,
      attachments: attachments,
    });

    const savedBid = await newBid.save();

    await notificationService.sendNotification({
      recipientId: newBid.owner,
      recipientType: "Homeowner",
      senderId: newBid.contractor,
      senderType: "Contractor",
      message: `New bid submitted by contractor for Job ${req.body.jobTitle}`,
      type: "bid",
      url: `/home-owner/bids-and-quotes`,
    });
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
        select: "username avatarUrl label",
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
  const notificationService = req.app.get("notificationService");

  if (user.role !== "owner") {
    return next(new BusinessLogicError());
  }

  const { bidId, contractor } = req.body;

  try {
    const bid = await BidModel.findOne({
      _id: bidId,
      status: "pending",
    });
    if (!bid) {
      return next(new NotFoundError("bid not found!"));
    }

    const job = await Job.findByIdAndUpdate(
      bid.jobId._id,
      { bidStatus: "closed" },
      { new: true }
    );

    bid.status = req.body.bidStatus;

    await bid.save();

    if (bid.status === "accepted") {
      const newProject = new ProjectModel({
        contractor,
        title: job.title,
        owner: user._id,
        jobId: bid.jobId,
        media: job.media,
        totalBudget: job.budget,
      });
      await newProject.save();
    }

    await notificationService.sendNotification({
      recipientId: contractor,
      recipientType: "Contractor",
      senderId: user._id,
      senderType: "Homeowner",
      message: `Your bid for Job ${job.title} has been ${req.body.bidStatus}`,
      type: "bidStatus",
      url: `/contractor/my-bids`,
    });

    return res
      .status(200)
      .json({ success: true, message: `Bid is ${req.body.bidStatus}`, bid });
  } catch (error) {
    return next(new InternalServerError("bid status can't be change"));
  }
};

export const getBid = async (req, res, next) => {
  const { id } = req.params;

  try {
    const bid = await BidModel.findById(id).populate({
      path: "contractor",
      select: "username avatarUrl label",
    });

    return res.status(200).json({ success: true, bid });
  } catch (error) {
    return next(new InternalServerError("Failed to fetch the bid"));
  }
};
