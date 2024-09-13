import mongoose from "mongoose";

export const ownerProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    progress: { type: String, default: "0" },
    images: [{ type: String }],
    status: { type: String },
    nextStage: { type: String },
    totalBudget: { type: String },
    spent: { type: String },
    paymentMethod: { type: String },
    nextPaymentDue: { type: Date },
  },
  { timestamps: true }
);

const OwnerProjectModel = mongoose.model("OwnerProjects", ownerProjectSchema);

export default OwnerProjectModel;
