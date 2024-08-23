import mongoose from "mongoose";

const BidSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  amount: { type: Number, required: true },
  detail: { type: string, required: true },
  estimateTime: { type: string, required: true },
});

const BidModel = mongoose.model("Bid", BidSchema);

export default BidModel;
