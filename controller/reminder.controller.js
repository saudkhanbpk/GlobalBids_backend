import EventsModel from "../model/events.model.js";
import Reminder from "../model/reminder.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createReminder = asyncHandler(async (req, res) => {
  const {
    reminderName,
    provider,
    policyNumber,
    renewalDate,
    policyAmount,
    renewalFrequency,
    notes,
  } = req.body;
  const userId = req.user._id;

  const newReminder = new Reminder({
    reminderName,
    provider,
    policyNumber,
    renewalDate,
    policyAmount,
    renewalFrequency,
    notes,
    user: userId,
  });

  const event = new EventsModel({
    title: reminderName,
    date: renewalDate,
    description: notes,
    eventType: "reminder",
    homeowner: req.user._id,
    reminderId: newReminder._id,
  });

  await event.save();

  await newReminder.save();
  res.status(201).json({
    message: "Reminder created successfully",
    reminder: newReminder,
    success: true,
  });
});

export const updateReminder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const updatedReminder = await Reminder.findOneAndUpdate(
    { _id: id },
    updateData,
    { new: true }
  );

  await EventsModel.findOneAndUpdate(
    { reminderId: id },
    {
      title: updateData.reminderName,
      date: updateData.renewalDate,
      description: updateData.notes,
    },
    { new: true }
  );

  if (!updatedReminder) {
    return res.status(404).json({ error: "Reminder not found" });
  }

  res.status(200).json({
    success: true,
    reminder: updatedReminder,
  });
});

export const deleteReminder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedReminder = await Reminder.findByIdAndDelete(id);

  if (!deletedReminder) {
    return res.status(404).json({ error: "Reminder not found" });
  }

  await EventsModel.findOneAndDelete({
    reminderId: id,
  });

  res.status(200).json({ success: true });
});

export const getAllReminders = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const reminders = await Reminder.find({ user: userId });

  res.status(200).json({ success: true, reminders });
});

export const getReminder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const reminder = await Reminder.findById(id);
  if (!reminder) {
    return res.status(404).json({ error: "Reminder not found" });
  }
  res.status(200).json({ success: true, reminder });
});
