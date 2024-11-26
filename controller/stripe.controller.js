import Stripe from "stripe";
import BidTransactionHistoryModel from "../model/transaction.model.js";
import { InternalServerError } from "../error/AppError.js";
import JobModel from "../model/job.model.js";
import BidModel from "../model/bids.model.js";
import { invoiceMailOptions } from "../utils/mail-options.js";
import { sendEmail } from "../utils/send-emails.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPayment = async (req, res, next) => {
  const { leadPrice } = req.body;
  const amountInCents = Math.round(leadPrice * 100);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
    });

    const data = {
      clientSecret: paymentIntent.client_secret,
      originalAmount: leadPrice,
    };
    return res.status(201).json(data);
  } catch (error) {
    return next(new InternalServerError());
  }
};

export const updateBidPayment = async (req, res, next) => {
  const {
    amount,
    jobId,
    bidId,
    cardDigit,
    contractor,
    transactionId,
    leadPrice,
    category,
    status,
    title,
    homeownerName,
  } = req.body;

  const userId = req.user._id;

  try {
    const newTransaction = new BidTransactionHistoryModel({
      user: userId,
      job: jobId,
      bid: bidId,
      category: category,
      amount: amount.toString(),
      transactionDate: new Date().toISOString(),
      status,
      cardDigit: cardDigit,
      transactionId: transactionId,
      leadPrice: leadPrice,
      title,
      homeownerName,
    });

    await newTransaction.save();

    await JobModel.findByIdAndUpdate(
      jobId,
      {
        bidStatus: "closed",
        progress: "0",
        status: "in-progress",
        contractor: contractor,
      },
      { new: true }
    );

    await BidModel.findByIdAndUpdate(bidId, {
      bidTransaction: newTransaction._id,
    });
    const mailtOptions = invoiceMailOptions(newTransaction, req.user.email);
    await sendEmail(mailtOptions);
    return res.status(201).json({
      success: true,
      transaction: newTransaction,
      messages: "Transaction ",
    });
  } catch (error) {
    console.log(error);
    return next(new InternalServerError());
  }
};

export const getPaymentHistory = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const transactions = await BidTransactionHistoryModel.find({
      user: userId,
    }).sort({ transactionDate: -1 });

    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    return next(new InternalServerError("Failed to fetch payment history."));
  }
};
