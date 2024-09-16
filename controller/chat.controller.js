import { InternalServerError } from "../error/AppError.js";
import MessageModel from "../model/chat.message.model.js";
import RoomModel from "../model/chat.room.model.js";

export const getAllMessages = async (req, res, next) => {
  try {
    const { roomId } = req.query;

    if (!roomId) {
      return res.status(400).json({ message: "roomId is required" });
    }

    const messages = await MessageModel.find({ roomId }).sort({ timestamp: 1 });

    if (!messages.length) {
      return res.status(404).json({ message: "No messages found" });
    }

    res.status(200).json(messages);
  } catch (error) {
    return next(new InternalServerError("Failed to load messages!"));
  }
};

export const getRooms = async (req, res, next) => {
  const userId = req.user._id;
  try {
    const rooms = await RoomModel.find({ users: userId })
      .populate({
        path: "users last_message",
        match: { _id: { $ne: userId } },
        select: "username imageUrl message senderId",
      })
      .exec();

    if (!rooms.length) {
      return res.status(404).json({ message: "No rooms found for this user" });
    }

    return res.status(200).json({ success: true, rooms });
  } catch (error) {
    return next(new InternalServerError("Failed to load rooms"));
  }
};

export const deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    const room = await RoomModel.findByIdAndDelete(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    return res.status(200).json({ message: "Room deleted successfully", id });
  } catch (error) {
    return next(new InternalServerError("Failed to delete room"));
  }
};
