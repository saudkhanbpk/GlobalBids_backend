import mongoose from "mongoose";

const weeklyScheduleSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  sunday: {
    type: Object,
    default: { closed: false, openTime: "", closeTime: "", timeSlots: [] },
  },
  monday: {
    type: Object,
    default: { closed: false, openTime: "", closeTime: "", timeSlots: [] },
  },
  tuesday: {
    type: Object,
    default: { closed: false, openTime: "", closeTime: "", timeSlots: [] },
  },
  wednesday: {
    type: Object,
    default: { closed: false, openTime: "", closeTime: "", timeSlots: [] },
  },
  thursday: {
    type: Object,
    default: { closed: false, openTime: "", closeTime: "", timeSlots: [] },
  },
  friday: {
    type: Object,
    default: { closed: false, openTime: "", closeTime: "", timeSlots: [] },
  },
  saturday: {
    type: Object,
    default: { closed: false, openTime: "", closeTime: "", timeSlots: [] },
  },
});

const WeeklyScheduleModel = mongoose.model(
  "WeeklySchedule",
  weeklyScheduleSchema
);

export default WeeklyScheduleModel;
