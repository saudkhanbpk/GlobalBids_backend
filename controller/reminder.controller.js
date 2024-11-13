import EventsModel from "../model/events.model.js";
import Reminder from "../model/reminder.model.js";

export const createReminder = async (req, res) => {
  try {
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
    });

    await event.save();

    await newReminder.save();
    res.status(201).json({
      message: "Reminder created successfully",
      reminder: newReminder,
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create reminder", details: error.message });
  }
};

export const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedReminder = await Reminder.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updateData,
      { new: true }
    );

    if (!updatedReminder) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    res.status(200).json({
      message: "Reminder updated successfully",
      reminder: updatedReminder,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update reminder", details: error.message });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReminder = await Reminder.findByIdAndDelete(id);

    if (!deletedReminder) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete reminder", details: error.message });
  }
};

export const getAllReminders = async (req, res) => {
  try {
    const userId = req.user._id;

    const reminders = await Reminder.find({ user: userId });

    res.status(200).json({ success: true, reminders });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch reminders", details: error.message });
  }
};
