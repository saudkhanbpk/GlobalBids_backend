import mongoose from "mongoose";

const BidSchema = new mongoose.Schema(
  {
    amount: { type: String, required: true },
    bidBreakdown: { type: String, required: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    status: {
      type: String,
      enum: ["accepted", "rejected", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const BidModel = mongoose.model("Bid", BidSchema);
export default BidModel;
