import {
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "../error/AppError.js";
import EventsModel from "../model/events.model.js";

export const createEvent = async (req, res, next) => {
  const { title, date, description } = req.body;
  const userId = req.user._id;
  const userType = req.user.role === "owner" ? "Homeowner" : "Contractor";
  try {
    if (!title || !date || !description) {
      return next(new ValidationError("all fields are required"));
    }
    const event = new EventsModel({
      user: userId,
      title,
      date,
      description,
      userType,
    });
    await event.save();
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
    const events = await EventsModel.find({ user: id });
    if (!events) {
      return next(new NotFoundError("can't found user events"));
    }
    return res.status(200).json({ success: true, events });
  } catch (error) {
    console.log(error);

    return next(new InternalServerError(""));
  }
};
