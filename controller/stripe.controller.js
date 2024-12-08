import Stripe from "stripe";
import BidTransactionHistoryModel from "../model/transaction.model.js";
import { InternalServerError } from "../error/AppError.js";
import JobModel from "../model/job.model.js";
import BidModel from "../model/bids.model.js";
import { invoiceMailOptions } from "../utils/mail-options.js";
import { sendEmail } from "../utils/send-emails.js";
import { createRoom } from "../services/chat.room.service.js";
import AccountModel from "../model/account.model.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const createPayment = async (req, res, next) => {
  const { leadPrice } = req.body;
  const amountInCents = Math.round(leadPrice * 100);
  const transactionDate = new Date().toISOString().split("T")[0];

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        user: req.user._id.toString(),
        project: req.body.project.toString(),
        bidId: req.body.bidId.toString(),
        leadPrice: leadPrice.toString(),
        projectId: req.body.jobId.toString(),
        category: req.body.category.toString(),
        homeowner: req.body.homeownerId,
      },
    });

    const newTransaction = await BidTransactionHistoryModel.create({
      user: req.user._id,
      job: req.body.jobId,
      bid: req.body.bidId,
      amount: req.body.leadPrice.toString(),
      transactionDate,
      status: "pending",
      category: req.body.category,
      transactionId: paymentIntent.id,
      leadPrice: leadPrice.toString(),
      homeowner: req.body.homeownerId,
    });
    const bid = await BidModel.findByIdAndUpdate(
      req.body.bidId,
      {
        bidTransaction: newTransaction._id,
      },
      {
        new: true,
      }
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
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const getPaymentHistory = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const transactions = await BidTransactionHistoryModel.find({
      user: userId,
    }).populate([
      {
        path: "job",
        select: "title",
      },
    ]);

    return res.status(200).json({
      success: true,
      transactions: transactions,
    });
  } catch (error) {
    return next(new InternalServerError("Failed to fetch payment history."));
  }
};

export const getHomeownerContact = async (req, res, next) => {
  const { id } = req.params;
  const { transactionId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
    let homeowner = null;
    switch (paymentIntent.status) {
      case "succeeded":
        homeowner = await AccountModel.findById(
          paymentIntent.metadata.homeowner
        )
          .select("email username profile")
          .populate({
            path: "profile",
            model: "HomeownerProfile",
            select: "phone",
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
  } catch (error) {
    return next(new InternalServerError("Failed to fetch homeowner contact."));
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  console.log("webhook invoke!");

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    switch (event.type) {
      case "payment_intent.succeeded":
        const { bidId, homeowner, user, projectId } =
          event.data.object.metadata;

        const userData = await AccountModel.findById(user).select("email");

        const room = await createRoom([homeowner, user], projectId);
        await JobModel.findByIdAndUpdate(
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
        const mailOptions = invoiceMailOptions(transaction, userData.email);
        await sendEmail(mailOptions);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
        break;
    }

    res.status(200).send({ received: true });
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
