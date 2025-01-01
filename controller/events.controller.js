import { ValidationError } from "../error/AppError.js";
import EventsModel from "../model/events.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    date,
    description,
    eventType,
    homeownerId,
    job,
    fromTime,
    toTime,
  } = req.body;
  const userId = req.user._id;
  const notificationService = req.app.get("notificationService");

  if (!title || !date || !description || !eventType || !toTime || !fromTime) {
    throw new ValidationError("all fields are required");
  }

  let event = new EventsModel({
    homeowner: homeownerId,
    job,
    title,
    date,
    description,
    contractor: userId,
    eventType,
    fromTime,
    toTime,
  });

  await event.save();
  event = await event.populate({
    path: "job",
    select: "title",
  });

  await notificationService.sendNotification({
    recipientId: homeownerId,
    recipientType: "Homeowner",
    senderId: userId,
    senderType: "Contractor",
    message: `You have a new ${eventType} event`,
    type: "event",
    url: `/home-owner/schedule`,
  });
  return res.status(200).json({ success: true, event, message: "event added" });
});

export const getEvents = asyncHandler(async (req, res) => {
  const id = req.user._id;

  const events = await EventsModel.find({
    $or: [{ homeowner: id }, { contractor: id }],
  }).populate({
    path: "job",
    select: "title",
  });
  if (!events) {
    throw new NotFoundError("can't found user events");
  }
  return res.status(200).json({ success: true, events });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const userId = req.user._id;

  const event = await EventsModel.findOneAndDelete({
    _id: id,
    contractor: userId,
  });

  if (!event) {
    throw new NotFoundError(
      "Event not found or you don't have permission to delete it"
    );
  }

  return res.status(200).json({ success: true, event });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const userId = req.user._id;

  let event = await EventsModel.findOneAndUpdate(
    { _id: id, contractor: userId },
    req.body,
    { new: true }
  ).populate({
    path: "job",
    select: "title",
  });

  if (!event) {
    throw new NotFoundError(
      "Event not found or you don't have permission to update it"
    );
  }
  return res
    .status(200)
    .json({ success: true, event, message: "event updated" });
});
