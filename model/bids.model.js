import mongoose from "mongoose";

const BidSchema = new mongoose.Schema(
  {
    amount: { type: String, required: true },
    bidBreakdown: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homeowner",
      required: true,
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
      required: true,
    },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    status: {
      type: String,
      enum: ["accepted", "rejected", "pending"],
      default: "pending",
    },
    comment: { type: String, required: true },
    startDate: { type: Date, required: true },
    projectDuration: { type: String, required: true },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

const BidModel = mongoose.model("Bid", BidSchema);
export default BidModel;
