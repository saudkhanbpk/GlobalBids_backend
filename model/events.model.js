import mongoose from "mongoose";

const eventsSchema = new mongoose.Schema({
  homeowner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Homeowner",
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Project",
  },
  contractor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Contractor",
  },
  eventType: {
    type: String,
    required: true,
    enum: ["installation", "general", "meetings"],
  },
  title: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
});

const EventsModel = mongoose.model("Events", eventsSchema);
export default EventsModel;
