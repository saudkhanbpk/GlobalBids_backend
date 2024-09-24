import BidModel from "../model/bids.model.js";
import {
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "../error/AppError.js";
import ProjectModel from "../model/project.model.js";

export const createBid = async (req, res, next) => {
  try {
    const { amount, ownerId, contractorId, jobId, bidBreakdown } = req.body;

    if (!amount || !ownerId || !contractorId || !jobId || !bidBreakdown) {
      return next(
        new ValidationError(
          "All fields (amount, ownerId, contractorId, jobId) are required."
        )
      );
    }
    const newBid = new BidModel({
      amount,
      bidBreakdown,
      ownerId,
      contractorId,
      jobId,
    });

    const savedBid = await newBid.save();

    return res.status(201).json({
      success: true,
      message: "Bid submitted successfully.",
      bid: savedBid,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return next(new ValidationError(error.message));
    }
    return next(
      new InternalServerError("Failed to create bid. Please try again later.")
    );
  }
};

export const getOwnerBids = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const bids = await BidModel.find({
      ownerId: ownerId,
      status: "pending",
    })
      .populate({
        path: "contractorId",
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
    const contractorId = req.user._id;
    const bids = await BidModel.find({ contractorId })
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

  const { bidId, bidStatus, contractor } = req.body;

  try {
    const bid = await BidModel.findOne({
      _id: bidId,
      status: "pending",
    }).populate("jobId");
    if (!bid) {
      return next(new NotFoundError("bid not found!"));
    }

    bid.status = bidStatus;

    if (bid.status === "accepted") {
      const newProject = new ProjectModel({
        contractor,
        title: bid.jobId.title,
        owner: user._id,
        images: [bid.jobId.file],
        totalBudget: bid.jobId.budget,
      });
      await newProject.save();
    }

    await bid.save();

    return res
      .status(200)
      .json({ success: true, message: `Bid is ${bidStatus}`, bid });
  } catch (error) {
    return next(new InternalServerError("bid status can't be change"));
  }
};
