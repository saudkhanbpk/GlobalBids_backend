import { connectedRooms, connectedUsers } from "../event/site-events.js";
import MessageModel from "../model/chat.message.model.js";
import RoomModel from "../model/chat.room.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.body;

  if (!roomId) {
    return res.status(400).json({ message: "roomId is required" });
  }

  const messages = await MessageModel.find({ roomId })
    .sort({
      timestamp: 1,
    })
    .populate({
      path: "eventId",
      populate: {
        path: "job",
        select: "title",
      },
    });

  if (!messages.length) {
    return res.status(404).json({ message: "No messages found" });
  }

  res.status(200).json({ success: true, messages });
});

export const getRooms = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const rooms = await RoomModel.find({ users: userId }).populate({
    path: "users last_message",
    match: { _id: { $ne: userId } },
    select: "username avatarUrl message senderId role",
  });
  if (!rooms.length) {
    return res.status(404).json({ message: "No rooms found for this user" });
  }

  return res.status(200).json({ success: true, rooms });
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const room = await RoomModel.findByIdAndDelete(id);
  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }
  return res.status(200).json({ success: true, id });
});

export const sendMessage = asyncHandler(async (req, res) => {
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
    eventId,
  } = req.body;

  let room = await RoomModel.findOne({
    users: { $all: [user._id, receiverId] },
  });

  const messageData = {
    roomId,
    senderId,
    receiverId,
    timestamp,
    timeZone,
  };

  if (message) {
    messageData.message = message;
  }

  if (eventId) {
    messageData.eventId = eventId;
  }

  let newMessage = await MessageModel.create(messageData);
  if (eventId) {
    newMessage = await newMessage.populate({
      path: "eventId",
      populate: {
        path: "job",
        select: "title",
      },
    });
  }

  switch (user.role) {
    case "contractor":
      room.lastMessageContractor = newMessage._id;
      break;
    case "homeowner":
      room.lastMessageHomeowner = newMessage._id;
      break;
    default:
      break;
  }

  if (connectedRooms[roomId]) {
    connectedRooms[roomId].forEach(async (socket_id) => {
      if (socket_id !== socketId) {
        io.to(socket_id).emit("message", newMessage);
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
  room.last_message = newMessage._id;
  await room.save();

  return res.status(201).json({ success: true, newMessage });
});

export const markMessagesAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { roomId } = req.body;

  const room = await RoomModel.findById(roomId);

  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }

  room.unreadMessages.set(userId.toString(), 0);
  await room.save();

  return res
    .status(200)
    .json({ success: true, message: "Messages marked as read" });
});

export const getUnreadMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;

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
});

export const getRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;

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
});

export const recentInteractions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const lastMessageField =
    req.user.role === "homeowner"
      ? "lastMessageContractor"
      : "lastMessageHomeowner";

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
});
