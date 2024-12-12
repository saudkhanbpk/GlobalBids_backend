import mongoose from "mongoose";

const jobInviteSchema = new mongoose.Schema(
  {
    homeowner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Account",
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
  },
  { timestamps: true }
);

const JobInviteModel = mongoose.model("JobInvite", jobInviteSchema);
export default JobInviteModel;
