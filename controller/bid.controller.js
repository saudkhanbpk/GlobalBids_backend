import BidModel from "../model/bids.model.js";
import {
  BusinessLogicError,
  NotFoundError,
  ValidationError,
} from "../error/AppError.js";
import JobModel from "../model/job.model.js";
import { validateBidFields } from "../validators/bid-validators.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createBid = asyncHandler(async (req, res) => {
  const notificationService = req.app.get("notificationService");
  const data = req.body;

  let job = null;

  job = await JobModel.findOne({ _id: data.job });
  if (!job) {
    throw new NotFoundError("Job not found.");
  }
  if (job.bidStatus === "closed") {
    throw new BusinessLogicError("Bids are closed for this job!");
  }

  const existingBid = await BidModel.findOne({
    homeowner: data.homeowner,
    contractor: data.contractor,
    job: data.job,
  });

  if (existingBid) {
    throw new BusinessLogicError(
      "You have already submitted a bid for this job."
    );
  }

  const validateFields = validateBidFields(data);
  if (validateFields) {
    throw new ValidationError("All the fields are required!");
  }
  const newBid = new BidModel(data);
  const savedBid = await newBid.save();

  job.bids.push(savedBid._id);
  await job.save();

  await notificationService.sendNotification({
    recipientId: newBid.homeowner,
    recipientType: "Homeowner",
    senderId: newBid.contractor,
    senderType: "Contractor",
    message: `New bid submitted by contractor for Job ${job.title}`,
    type: "bid",
    url: `/home-owner/bid-detail/${newBid._id}`,
  });
  return res.status(201).json({
    success: true,
    message: "Bid submitted successfully.",
    bid: savedBid,
  });
});

export const getHomeownerBids = asyncHandler(async (req, res) => {
  const homeownerId = req.user._id;
  const bids = await BidModel.find({
    homeowner: homeownerId,
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
    .sort({ createdAt: 1 });
  return res.status(200).json({ success: true, bids });
});

export const getContractorBids = asyncHandler(async (req, res) => {
  const contractor = req.user._id;
  const bids = await BidModel.find({ contractor })
    .populate([
      {
        path: "job",
        select: "title room",
      },
      {
        path: "bidTransaction",
        select: "status amount",
      },
    ])
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, bids });
});

export const changeBidStatus = asyncHandler(async (req, res) => {
  const user = req.user;
  const notificationService = req.app.get("notificationService");

  if (user.role !== "homeowner") {
    throw new BusinessLogicError();
  }

  const { bidId } = req.body;

  const bid = await BidModel.findOne({
    _id: bidId,
    status: "pending",
  }).populate({ path: "job", select: "title" });
  if (!bid) {
    throw new NotFoundError("bid not found!");
  }

  bid.status = req.body.bidStatus;
  await bid.save();

  if (bid.status === "accepted") {
    await JobModel.findOneAndUpdate(
      { user: req.user._id, _id: bid.job },
      { bidStatus: "closed", acceptedBid: bidId, contractor: bid.contractor }
    );
  }

  await notificationService.sendNotification({
    recipientId: bid.contractor,
    recipientType: "Contractor",
    senderId: user._id,
    senderType: "Homeowner",
    message: `Your bid for Job ${bid.job.title} has been ${req.body.bidStatus}`,
    type: "bidStatus",
    url: `/contractor/bid-detail/${bidId}`,
  });

  return res.status(200).json({
    success: true,
    message: `Bid is ${req.body.bidStatus}`,
    bid,
  });
});

export const getBids = asyncHandler(async (req, res) => {
  const id = req.user._id;

  const bids = await BidModel.find({
    $or: [{ homeowner: id }, { contractor: id }],
  })
    .populate([
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
    ])
    .sort({ createdAt: -1 });
  return res.status(200).json({ success: true, bids });
});

export const getBid = asyncHandler(async (req, res) => {
  const bidId = req.params.id;

  const bid = await BidModel.findById(bidId).populate([
    {
      path: "bidTransaction",
    },
    {
      path: "job",
      select: "title budget category room",
    },
  ]);
  return res.status(200).json({ success: true, bid });
});

export const updateBid = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, ...rest } = req.body;
  const notificationService = req.app.get("notificationService");

  const bid = await BidModel.findByIdAndUpdate(
    id,
    { $set: rest },
    { new: true }
  );
  if (!bid) {
    throw new NotFoundError("Bid not found");
  }

  // await notificationService.sendNotification({
  //   recipientId: bid.homeowner,
  //   recipientType: "Homeowner",
  //   senderId: bid.contractor,
  //   senderType: "Contractor",
  //   message: `Your bid for Job ${bid.job.title} has been updated`,
  //   type: "bidStatus",
  //   url: `/homeowner/bid-detail/${id}`,
  // })

  return res.status(200).json({ success: true, bid, message: "Bid updated" });
});

export const bidEarningOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [results] = await BidModel.aggregate([
    {
      $match: {
        status: "accepted",
        contractor: userId,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalEarnings: { $sum: { $toDouble: "$bidAmount" } },
      },
    },
    {
      $group: {
        _id: null,
        monthlyEarnings: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$_id.year", currentYear] },
                  { $eq: ["$_id.month", currentMonth] },
                ],
              },
              "$totalEarnings",
              0,
            ],
          },
        },
        yearlyEarnings: {
          $sum: {
            $cond: [{ $eq: ["$_id.year", currentYear] }, "$totalEarnings", 0],
          },
        },
        totalEarnings: { $sum: "$totalEarnings" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      monthlyEarnings: results?.monthlyEarnings || 0,
      yearlyEarnings: results?.yearlyEarnings || 0,
      totalEarnings: results?.totalEarnings || 0,
    },
  });
});
