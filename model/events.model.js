import mongoose from "mongoose";

const eventsSchema = new mongoose.Schema(
  {
    homeowner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homeowner",
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
    },
    eventType: {
      type: String,
      required: true,
      enum: ["installation", "general", "meetings", "reminder"],
    },
    title: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String },
    reminderId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

const EventsModel = mongoose.model("Events", eventsSchema);
export default EventsModel;
