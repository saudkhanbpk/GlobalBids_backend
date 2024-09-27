import NotificationModel from "../model/notification.model.js";
import { InternalServerError } from "../error/AppError.js";

export const getNotifications = async (req, res, next) => {
  const user = req.user;

  try {
    const notifications = await NotificationModel.find({
      recipientId: user._id,
      read: false,
    }).sort({ createdAt: -1 });

    const totalDocs = await NotificationModel.countDocuments({
      recipientId: user._id,
    });

    return res
      .status(200)
      .json({ success: true, notifications, unreadCount: totalDocs });
  } catch (error) {
    return next(new InternalServerError("Can't get notifications"));
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.json({ notification: updatedNotification });
  } catch (error) {
    next(new InternalServerError("Failed to mark notification as read"));
  }
};
