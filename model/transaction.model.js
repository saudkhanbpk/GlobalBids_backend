import mongoose from "mongoose";

const bidTransactionHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    bid: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" },
    amount: { type: String, required: true },
    transactionDate: { type: String },
    status: { type: String, enum: ["pending", "succeeded", "in-complete"] },
    category: { type: String, enum: ["small", "medium", "large"] },
    transactionId: { type: String },
    leadPrice: { type: String },
    homeowner: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  },
  { timestamps: true }
);

const BidTransactionHistoryModel = mongoose.model(
  "BidTransactionHistory",
  bidTransactionHistorySchema
);

export default BidTransactionHistoryModel;
