import { connectedUsers } from "../event/site-events.js";
import NotificationModel from "../model/notification.model.js";
class NotificationService {
  constructor(io) {
    this.io = io;
  }

  async sendNotification({
    recipientId,
    recipientType,
    senderId,
    senderType,
    message,
    type,
    url,
  }) {
    try {
      const notification = new NotificationModel({
        recipientId,
        recipient: recipientType,
        senderId,
        senderModel: senderType,
        message,
        type,
        url,
      });
      const savedNotification = await notification.save();

      if (this.io && connectedUsers[recipientId]) {
        this.io
          .to(connectedUsers[recipientId])
          .emit("notification", savedNotification);
      }

      return savedNotification;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw new Error("Failed to send notification.");
    }
  }
}

export default NotificationService;
