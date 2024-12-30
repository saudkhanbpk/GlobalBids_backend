import Stripe from "stripe";
import BidTransactionHistoryModel from "../model/transaction.model.js";
import { InternalServerError, ValidationError } from "../error/AppError.js";
import JobModel from "../model/job.model.js";
import BidModel from "../model/bids.model.js";
import { invoiceMailOptions } from "../utils/mail-options.js";
import { sendEmail } from "../utils/send-emails.js";
import { createRoom } from "../services/chat.room.service.js";
import AccountModel from "../model/account.model.js";
import EventsModel from "../model/events.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPayment = asyncHandler(async (req, res, next) => {
  const { leadPrice, project, bidId, jobId, category, homeownerId } = req.body;

  if (!leadPrice || !project || !bidId || !jobId || !category || !homeownerId) {
    throw new ValidationError("Missing required fields");
  }

  const job = await JobModel.findById(jobId);

  if (!job) {
    throw new ValidationError("Job not found");
  }

  const amountInCents = Math.round(leadPrice * 100);
  const transactionDate = new Date().toISOString().split("T")[0];

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    metadata: {
      user: req.user._id?.toString() || "Unknown",
      project: project.toString(),
      bidId: bidId.toString(),
      leadPrice: leadPrice.toString(),
      projectId: jobId.toString(),
      category: category.toString(),
      homeowner: homeownerId.toString(),
    },
  });

  const newTransaction = await BidTransactionHistoryModel.create({
    user: req.user._id,
    job: jobId,
    bid: bidId,
    amount: leadPrice.toString(),
    transactionDate,
    status: "pending",
    category,
    transactionId: paymentIntent.id,
    leadPrice: leadPrice.toString(),
    homeowner: homeownerId,
  });

  const bid = await BidModel.findByIdAndUpdate(
    bidId,
    { bidTransaction: newTransaction._id },
    { new: true }
  ).populate([
    {
      path: "job",
      select: "title budget category",
    },
  ]);

  const data = {
    clientSecret: paymentIntent.client_secret,
    originalAmount: leadPrice,
    bid,
  };

  return res.status(201).json(data);
});

export const getPaymentHistory = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const transactions = await BidTransactionHistoryModel.find({
    user: userId,
  })
    .populate([
      {
        path: "job",
        select: "title",
      },
    ])
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    transactions: transactions,
  });
});

export const getHomeownerContact = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { transactionId } = req.body;

  const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
  let homeowner = null;
  switch (paymentIntent.status) {
    case "succeeded":
      homeowner = await AccountModel.findById(paymentIntent.metadata.homeowner)
        .select("email username profile profileType")
        .populate({
          path: "profile",
          select: "phone propertyDetails.address",
        });
      return res.status(200).json({
        success: true,
        homeowner,
      });
    case "requires_payment_method":
      return res.status(200).json({
        success: true,
        message: "required payment",
        paymentIntent,
      });
    default:
      return res.status(200).json({
        success: true,
        message: "failed",
      });
  }
});

export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

  switch (event.type) {
    case "payment_intent.succeeded":
      const { bidId, homeowner, user, projectId } = event.data.object.metadata;

      const userData = await AccountModel.findById(user).select("email");
      const bid = await BidModel.findById(bidId);
      const room = await createRoom([homeowner, user], projectId);
      const job = await JobModel.findByIdAndUpdate(
        projectId,
        {
          bidStatus: "closed",
          progress: "0",
          status: "in-progress",
          room: room._id,
        },
        { new: true }
      );
      const transaction = await BidTransactionHistoryModel.findOneAndUpdate(
        { user, job: projectId, bid: bidId },
        {
          status: "succeeded",
        },
        { new: true }
      );

      const isoStartDate = new Date(bid.startDate).toISOString();

      await EventsModel.create({
        homeowner: homeowner,
        job: projectId,
        contractor: user,
        eventType: "general",
        title: job.title,
        description: `The project "${job.title}" is set to begin.`,
        date: isoStartDate,
      });

      const mailOptions = invoiceMailOptions(transaction, userData.email);
      await sendEmail(mailOptions);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }

  return res.status(200).send({ received: true });
});
