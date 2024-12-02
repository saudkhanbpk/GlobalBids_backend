import mongoose from "mongoose";

const bidTransactionHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    bid: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" },
    amount: { type: String, required: true },
    transactionDate: { type: String },
    status: { type: String },
    category: { type: String, enum: ["small", "medium", "large"] },
    cardDigit: { type: String },
    transactionId: { type: String },
    leadPrice: { type: String },
    contractor: { type: String },
    title: { type: String },
    homeownerName: { type: String },
  },
  { timestamps: true }
);

const BidTransactionHistoryModel = mongoose.model(
  "BidTransactionHistory",
  bidTransactionHistorySchema
);

export default BidTransactionHistoryModel;
