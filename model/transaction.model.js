import mongoose from "mongoose";

const bidTransactionHistorySchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    bid: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" }, // Use ObjectId to reference the Bid
    amount: { type: String, required: true },
    transactionDate: { type: String },
    status: { type: String, enum: ["paid", "pending"] },
    category: { type: String },
    cardDigit: { type: String },
    transactionId: { type: String },
    contractor: { type: String },
}, { timestamps: true });


const BidTransactionHistoryModel = mongoose.model("BidTransactionHistory", bidTransactionHistorySchema);

export default BidTransactionHistoryModel;
