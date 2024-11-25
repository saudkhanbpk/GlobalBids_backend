import BidModel from "../model/bids.model.js";
import {
  BusinessLogicError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "../error/AppError.js";
import JobModel from "../model/job.model.js";
import { validateBidFields } from "../validators/bid-validators.js";
import { createRoom } from "../services/chat.room.service.js";

export const createBid = async (req, res, next) => {
  const notificationService = req.app.get("notificationService");
  const data = req.body;

  let job = null;
  try {
    job = await JobModel.findOne({ _id: data.job });
    if (!job) {
      return next(new NotFoundError("Job not found."));
    }
    if (job.bidStatus === "closed") {
      return next(new BusinessLogicError("Bids are closed for this job!"));
    }

    const existingBid = await BidModel.findOne({
      homeowner: data.homeowner,
      contractor: data.contractor,
      job: data.job,
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
    const validateFields = validateBidFields(data);
    if (validateFields) {
      return next(new ValidationError("All the fields are required!"));
    }
    const newBid = new BidModel(data);
    const savedBid = await newBid.save();

    await notificationService.sendNotification({
      recipientId: newBid.homeowner,
      recipientType: "Homeowner",
      senderId: newBid.contractor,
      senderType: "Contractor",
      message: `New bid submitted by contractor for Job ${job.title}`,
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
      homeowner: ownerId,
      status: "pending",
    })
      .populate([
        {
          path: "contractor",
          select: "username avatarUrl label ",
        },
        {
          path: "job",
          select: "title budget",
        },
      ])
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
        path: "job",
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
    }).populate({ path: "job", select: "title" });
    if (!bid) {
      return next(new NotFoundError("bid not found!"));
    }

    bid.status = req.body.bidStatus;
    await bid.save();
    if (bid.status === "accepted") {
      await createRoom([user._id, bid.contractor], bid.job);
    }

    await notificationService.sendNotification({
      recipientId: contractor,
      recipientType: "Contractor",
      senderId: user._id,
      senderType: "Homeowner",
      message: `Your bid for Job ${bid.job.title} has been ${req.body.bidStatus}`,
      type: "bidStatus",
      url: `/contractor/my-bids`,
    });

    return res
      .status(200)
      .json({ success: true, message: `Bid is ${req.body.bidStatus}`, bid });
  } catch (error) {
    console.log(error);

    return next(new InternalServerError("bid status can't be change"));
  }
};

export const getBids = async (req, res, next) => {
  const id = req.user._id;
  try {
    const bids = await BidModel.find({
      $or: [{ homeowner: id }, { contractor: id }],
    }).populate([
      {
        path: "contractor",
        select: "username avatarUrl label email phone",
      },
      {
        path: "homeowner",
        select: "username avatarUrl label email phone",
      },
      {
        path: "job",
      },
    ]);
    return res.status(200).json({ success: true, bids });
  } catch (error) {
    return next(new InternalServerError("Failed to fetch the bid"));
  }
};

export const getBid = async (req, res, next) => {
  const bidId = req.params.id;
  const user = req.user.role === "contractor" ? "homeowner" : "contractor";
  try {
    const bid = await BidModel.findById(bidId).populate([
      {
        match: { status: { $eq: "paid" } },
        path: "bidTransaction",
      },
      {
        path: user,
        select: "username avatarUrl label email phone",
      },
      {
        path: "job",
        select: "title budget category",
      },
    ]);

    return res.status(200).json({ success: true, bid });
  } catch (error) {
    return next(new InternalServerError("Failed to fetch the bid"));
  }
};

export const updateBid = async (req, res, next) => {
  const { id } = req.params;
  const { status, ...rest } = req.body;
  try {
    const bid = await BidModel.findByIdAndUpdate(
      id,
      { $set: rest },
      { new: true }
    );
    if (!bid) {
      return next(new NotFoundError("Bid not found"));
    }
    return res.status(200).json({ success: true, bid });
  } catch (error) {
    return next(new InternalServerError("Failed to update the bid"));
  }
};
