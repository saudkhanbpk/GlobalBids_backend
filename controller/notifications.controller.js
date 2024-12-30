import NotificationModel from "../model/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const user = req.user;

  const notifications = await NotificationModel.find({
    recipientId: user._id,
    read: false,
  }).sort({ createdAt: -1 });

  const totalDocs = await NotificationModel.countDocuments({
    recipientId: user._id,
    read: false,
  });
  return res
    .status(200)
    .json({ success: true, notifications, unreadCount: totalDocs });
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedNotification = await NotificationModel.findByIdAndUpdate(
    id,
    { read: true },
    { new: true }
  );
  if (!updatedNotification) {
    return res.status(404).json({ message: "Notification not found" });
  }
  return res.json({ notification: updatedNotification });
});

export const markAllMessagesAsRead = asyncHandler(async (req, res) => {
  const user = req.user;
  const notifications = await NotificationModel.updateMany(
    { recipientId: user._id },
    { read: true }
  );
  return res.status(200).json({
    message: "All notifications marked as read",
    notifications,
    success: true,
  });
});
