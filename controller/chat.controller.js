import { InternalServerError } from "../error/AppError.js";
import { connectedUsers } from "../event/site-events.js";
import MessageModel from "../model/chat.message.model.js";
import RoomModel from "../model/chat.room.model.js";
import UserModel from "../model/user.model.js";

export const getAllMessages = async (req, res, next) => {
  const { receiverId } = req.body;
  const userId = req.user._id;
  try {
    const room = await RoomModel.findOne({
      users: { $all: [userId, receiverId] },
    });
    if (!room._id) {
      return res.status(400).json({ message: "roomId is required" });
    }

    const messages = await MessageModel.find({ roomId: room._id }).sort({
      timestamp: 1,
    });

    if (!messages.length) {
      return res.status(404).json({ message: "No messages found" });
    }

    res.status(200).json({ success: true, messages });
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

export const getCurrentUser = async (req, res, next) => {
  const { userId } = req.body;

  try {
    const user = await UserModel.findById(userId).select("imageUrl username");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isOnline = Boolean(connectedUsers[userId]);

    return res
      .status(200)
      .json({ success: true, user: { ...user._doc, online: isOnline } });
  } catch (error) {
    return next(new InternalServerError("Failed to retrieve user"));
  }
};

export const sendMessage = async (req, res, next) => {
  const userId = req.user._id;
  const { receiverId, message, timestamp, timeZone } = req.body;
  let newRoom = false;
  try {
    let room = await RoomModel.findOne({
      users: { $all: [userId, receiverId] },
    });

    if (!room) {
      room = new RoomModel({
        users: [userId, receiverId],
      });
      await room.save();
      newRoom = true;
    }

    const messageData = {
      roomId: room._id,
      senderId: userId,
      receiverId,
      message,
      timestamp,
      timeZone,
    };

    const newMessage = new MessageModel(messageData);
    await newMessage.save();

    room.last_message = newMessage._id;
    await room.save();
    return res.status(201).json({ success: true, newRoom, newMessage });
  } catch (error) {
    console.log();

    return next(new InternalServerError("can't send message"));
  }
};

export const getNewRoomData = async (req, res, next) => {
  const { id } = req.params;
  const { receiverId } = req.body;
  try {
    const room = await RoomModel.findById(id).populate({
      path: "users",
      match: {
        _id: { $eq: receiverId },
      },
      select: "username imageUrl message senderId ",
    });
    return res.status(200).json({ success: true, room });
  } catch (error) {
    return next(new InternalServerError("can't get new room"));
  }
};
