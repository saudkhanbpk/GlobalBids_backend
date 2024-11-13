import mongoose from "mongoose";

const BidSchema = new mongoose.Schema(
  {
    bidAmount: { type: String, required: true },
    estimatedTimeLine: {
      type: String,
      required: true,
    },
    scopeOfWork: { type: String, required: true },
    startDate: { type: Date },
    ProjectMileStone: [],
    termsConditions: {
      type: String,
      required: true,
    },
    additionalNotes: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted", "rejected", "pending"],
      default: "pending",
    },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    homeowner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homeowner",
      required: true,
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
      required: true,
    },
  },
  { timestamps: true }
);

const BidModel = mongoose.model("Bid", BidSchema);
export default BidModel;
