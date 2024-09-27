import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homeowner",
      required: true,
    },
    progress: { type: String, default: "0" },
    images: [{ type: String }],
    status: { type: String, default: "pending" },
    nextStage: { type: String },
    totalBudget: { type: String },
    spent: { type: String },
    paymentMethod: { type: String },
    nextPaymentDue: { type: Date },
  },
  { timestamps: true }
);

const ProjectModel = mongoose.model("Projects", projectSchema);

export default ProjectModel;
