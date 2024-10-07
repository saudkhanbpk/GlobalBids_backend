import BidModel from "../model/bids.model.js";
import {
  BusinessLogicError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "../error/AppError.js";
import ProjectModel from "../model/project.model.js";
import NotificationModel from "../model/notification.model.js";
import { connectedUsers } from "../event/site-events.js";
import Job from "../model/job.model.js";

export const createBid = async (req, res, next) => {
  const io = req.app.get("io");
  try {
    const { amount, ownerId, contractorId, jobId, bidBreakdown, jobTitle } =
      req.body;

    if (
      !amount ||
      !ownerId ||
      !contractorId ||
      !jobId ||
      !bidBreakdown ||
      !jobTitle
    ) {
      return next(
        new ValidationError(
          "All fields (amount, ownerId, contractorId, jobId) are required."
        )
      );
    }

    const job = await Job.findOne({ _id: jobId });
    if (job.bidStatus === "closed") {
      return next(new BusinessLogicError("Bids are close for this job!"));
    }

    const existingBid = await BidModel.findOne({
      owner: ownerId,
      contractor: contractorId,
      jobId,
    });

    if (existingBid) {
      return next(
        new BusinessLogicError("You have already submitted a bid for this job.")
      );
    }

    const newBid = new BidModel({
      amount,
      bidBreakdown,
      owner: ownerId,
      contractor: contractorId,
      jobId,
    });

    const savedBid = await newBid.save();

    const notification = new NotificationModel({
      recipientId: ownerId,
      recipientModel: "Homeowner",
      senderId: contractorId,
      senderModel: "Contractor",
      message: `New bid submitted by contractor for Job ${jobTitle}`,
      type: "bid",
      url: `/home-owner/jobs/job-details/${jobId}`,
    });

    await notification.save();

    io.to(connectedUsers[ownerId]).emit("notification", notification);

    return res.status(201).json({
      success: true,
      message: "Bid submitted successfully.",
      bid: savedBid,
    });
  } catch (error) {
    console.log(error);

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
