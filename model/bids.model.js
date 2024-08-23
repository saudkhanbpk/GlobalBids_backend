import mongoose from "mongoose";

const BidSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    amount: { type: Number, required: true },
    detail: { type: String, required: true },
    estimateTime: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const BidModel = mongoose.model("Bid", BidSchema);

export default BidModel;
