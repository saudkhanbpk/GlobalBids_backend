import { InternalServerError } from "../error/AppError.js";
import { connectedRooms, connectedUsers } from "../event/site-events.js";
import MessageModel from "../model/chat.message.model.js";
import RoomModel from "../model/chat.room.model.js";

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
  const notificationService = req.app.get("notificationService");
  const {
    receiverId,
    message,
    timestamp,
    timeZone,
    roomId,
    senderId,
    socketId,
  } = req.body;

  try {
    let room = await RoomModel.findOne({
      users: { $all: [user._id, receiverId] },
    });

    const messageData = {
      roomId,
      senderId,
      receiverId,
      message,
      timestamp,
      timeZone,
    };

    const newMessage = new MessageModel(messageData);
    switch (user.role) {
      case "contractor":
        room.lastMessageContractor = newMessage._id;
        break;
      case "owner":
        room.lastMessageHomeowner = newMessage._id;
        break;
      default:
        break;
    }

    if (connectedRooms[roomId]) {
      connectedRooms[roomId].forEach(async (socket_id) => {
        if (socket_id !== socketId) {
          io.to(socket_id).emit("message", newMessage);
          console.log(socket_id);
        }
        if (connectedRooms[roomId].length === 1) {
          room.unreadMessages.set(
            receiverId.toString(),
            (room.unreadMessages.get(receiverId.toString()) || 0) + 1
          );
          await notificationService.sendNotification({
            recipientId: receiverId,
            recipientType: "Contractor",
            senderId: user._id,
            senderType: "Homeowner",
            message: `New message from ${user.username}`,
            type: "message",
            url: `${
              user.role === "contractor" ? "/home-owner" : "/contractor"
            }/messages/${roomId}`,
          });
        }
      });
    }
    await newMessage.save();
    room.last_message = newMessage._id;
    await room.save();

    return res.status(201).json({ success: true, newMessage });
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
    const userStatus = {};
    if (connectedUsers[room.users[0]._id]) {
      userStatus["status"] = "online";
      userStatus["userId"] = room.users[0]._id;
    }
    return res.status(200).json({ success: true, room, userStatus });
  } catch (error) {
    return next(new InternalServerError("can't get new room"));
  }
};

export const recentInteractions = async (req, res, next) => {
  const userId = req.user._id;
  const lastMessageField =
    req.user.role === "owner"
      ? "lastMessageContractor"
      : "lastMessageHomeowner";

  try {
    const rooms = await RoomModel.find({
      users: userId,
    })
      .populate([
        {
          path: "job",
          select: "title",
        },
        {
          path: "users",
          match: { _id: { $ne: userId } },
          select: "username avatarUrl",
        },
        {
          path: lastMessageField,
          select: "message senderId timestamp",
        },
      ])
      .sort({ updatedAt: -1 })
      .limit(3);

    return res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent interactions.",
    });
  }
};
