import { InternalServerError } from "../error/AppError.js";
import { connectedUsers } from "../event/site-events.js";
import MessageModel from "../model/chat.message.model.js";
import RoomModel from "../model/chat.room.model.js";
import { getUserById } from "../services/user.service.js";

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
        select: "username avatarUrl message senderId",
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

export const getCurrentUser = async (req, res, next) => {
  const { userId } = req.body;

  try {
    const user = await getUserById(userId, "username avatarUrl role");

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

export const getNewRoomData = async (req, res, next) => {
  const { id } = req.params;
  const { receiverId } = req.body;
  try {
    const room = await RoomModel.findById(id).populate([
      {
        path: "users",
        match: { _id: { $eq: receiverId } },
        select: "username avatarUrl",
      },
      {
        path: "last_message",
        select: "message senderId",
      },
    ]);
    return res.status(200).json({ success: true, room });
  } catch (error) {
    return next(new InternalServerError("can't get new room"));
  }
};

export const sendMessage = async (req, res, next) => {
  const user = req.user;
  const io = req.app.get("io");
  const { receiverId, message, timestamp, timeZone } = req.body;
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
      roomId: room._id,
      senderId: user._id,
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
