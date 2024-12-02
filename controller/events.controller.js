import {
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "../error/AppError.js";
import EventsModel from "../model/events.model.js";

export const createEvent = async (req, res, next) => {
  const { title, date, description, eventType, homeownerId, jobId } = req.body;
  const userId = req.user._id;
  const notificationService = req.app.get("notificationService");

  try {
    if (!title || !date || !description || !eventType) {
      return next(new ValidationError("all fields are required"));
    }
    const event = new EventsModel({
      homeowner: homeownerId,
      project: jobId,
      title,
      date,
      description,
      contractor: userId,
      eventType,
    });
    await event.save();
    await notificationService.sendNotification({
      recipientId: homeownerId,
      recipientType: "Homeowner",
      senderId: userId,
      senderType: "Contractor",
      message: `You have a new ${eventType} event`,
      type: "event",
      url: `/home-owner/schedule`,
    })
    return res
      .status(200)
      .json({ success: true, event, message: "event has been added" });
  } catch (error) {
    console.log(error);
    
    return next(new InternalServerError("can't create event"));
  }
};

export const getEvents = async (req, res, next) => {
  const id = req.user._id;
  try {
    const events = await EventsModel.find({
      $or: [{ homeowner: id }, { contractor: id }],
    }).populate({
      path: "job",
      select: "title",
    });
    if (!events) {
      return next(new NotFoundError("can't found user events"));
    }
    return res.status(200).json({ success: true, events });
  } catch (error) {
    return next(new InternalServerError(""));
  }
};

export const deleteEvent = async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user._id;
  try {
    const event = await EventsModel.findOneAndDelete({
      _id: id,
      contractor: userId,
    });

    if (!event) {
      return next(
        new NotFoundError(
          "Event not found or you don't have permission to delete it"
        )
      );
    }

    return res.status(200).json({ success: true, event });
  } catch (error) {
    return next(new InternalServerError("Unable to delete event"));
  }
};

export const updateEvent = async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user._id;

  try {
    const event = await EventsModel.findOneAndUpdate(
      { _id: id, contractor: userId },
      req.body,
      { new: true }
    );
    if (!event) {
      return next(
        new NotFoundError(
          "Event not found or you don't have permission to update it"
        )
      );
    }
    return res.status(200).json({ success: true, event });
  } catch (error) {
    return next(new InternalServerError("Unable to update event"));
  }
};
