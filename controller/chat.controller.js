import { InternalServerError } from "../error/AppError.js";
import { connectedUsers } from "../event/site-events.js";
import MessageModel from "../model/chat.message.model.js";
import RoomModel from "../model/chat.room.model.js";
import { getUserById } from "../services/user.service.js";

export const getAllMessages = async (req, res, next) => {
  const { roomId } = req.body;
  try {
    if (!roomId) {
      return res.status(400).json({ message: "roomId is required" });
    }

    const messages = await MessageModel.find({ roomId }).sort({
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
        select: "username avatarUrl message senderId role",
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
    return res.status(200).json({ success: true, id });
  } catch (error) {
    return next(new InternalServerError("Failed to delete room"));
  }
};

export const sendMessage = async (req, res, next) => {
  const user = req.user;
  const io = req.app.get("io");
  const { receiverId, message, timestamp, timeZone, roomId, senderId } =
    req.body;
  let newRoom = false;

  const userType = user.role === "owner" ? "Homeowner" : "Contractor";
  const receiverType =
    req.body.receiverType === "owner" ? "Homeowner" : "Contractor";

  try {
    let room = await RoomModel.findOne({
      users: { $all: [user._id, receiverId] },
    });

    if (!room) {
      room = new RoomModel({
        users: [user._id, receiverId],
        userTypes: [userType, receiverType],
      });
      await room.save();
      newRoom = true;
    }

    const messageData = {
      roomId,
      senderId,
      receiverId,
      message,
      timestamp,
      timeZone,
    };

    const newMessage = new MessageModel(messageData);
    await newMessage.save();

    room.unreadMessages.set(
      receiverId.toString(),
      (room.unreadMessages.get(receiverId.toString()) || 0) + 1
    );

    room.last_message = newMessage._id;
    await room.save();

    if (connectedUsers[receiverId]) {
      const receiverSocketId = connectedUsers[receiverId];
      io.to(receiverSocketId).emit("message", newMessage);
    }

    return res.status(201).json({ success: true, newRoom, newMessage });
  } catch (error) {
    return next(new InternalServerError("Can't send message"));
  }
};

export const markMessagesAsRead = async (req, res, next) => {
  const userId = req.user._id;
  const { roomId } = req.body;

  try {
    const room = await RoomModel.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.unreadMessages.set(userId.toString(), 0);
    await room.save();

    return res
      .status(200)
      .json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    return next(new InternalServerError("Can't mark messages as read"));
  }
};

export const getUnreadMessages = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const result = await RoomModel.aggregate([
      {
        $match: {
          users: userId,
        },
      },
      {
        $project: {
          unreadCount: {
            $ifNull: [
              {
                $reduce: {
                  input: { $objectToArray: "$unreadMessages" },
                  initialValue: 0,
                  in: {
                    $cond: [
                      { $eq: ["$$this.k", userId.toString()] },
                      "$$this.v",
                      "$$value",
                    ],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalUnreadMessages: { $sum: "$unreadCount" },
        },
      },
    ]);

    const totalUnreadMessages =
      result.length > 0 ? result[0].totalUnreadMessages : 0;

    return res.status(200).json({
      success: true,
      unreadMessages: totalUnreadMessages,
    });
  } catch (error) {
    return next(new InternalServerError("Failed to fetch notifications"));
  }
};

export const getRoom = async (req, res, next) => {
  const { id } = req.params;

  try {
    const room = await RoomModel.findById(id).populate({
      path: "users",
      match: { _id: { $ne: req.user._id } },
      select: "username avatarUrl",
    });
    return res.status(200).json({ success: true, room });
  } catch (error) {
    return next(new InternalServerError("can't get new room"));
  }
};

export const recentInteractions = async (req, res, next) => {
  const userId = req.user._id;
  const lastMessage =
    req.user.role === "owner"
      ? "lastMessageContractor"
      : "lastMessageHomeowner";

  try {
    const rooms = await RoomModel.find({
      users: userId,
    }).populate([
      {
        path: "job",
        select: "title",
      },
      {
        path: "users",
        match: { _id: { $ne: userId } },
        select: "username avatarUrl message senderId",
      },
      {
        path: lastMessage,
        select: "message senderId",
      },
    ]);
    return res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.log(error);
  }
};
