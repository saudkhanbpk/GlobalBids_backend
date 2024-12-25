import cron from "node-cron";
import NotificationService from "./notification.service.js";
import EventsModel from "../model/events.model.js";
import {
  OVERDUE_JOB_MESSAGE,
  OVERDUE_REMINDER_MESSAGE,
} from "../constants/event.constants.js";

const sendOverdueNotifications = (io) => {
  const notificationService = new NotificationService(io);

  cron.schedule("0 * * * *", async () => {
    const now = new Date();
    const userEvents = await EventsModel.find({
      date: { $lt: now.toISOString() },
      notified: false,
    });

    for (const event of userEvents) {
      const overDueMessage =
        event.eventType === "reminder"
          ? OVERDUE_REMINDER_MESSAGE.replace("{eventTitle}", event.title)
          : OVERDUE_JOB_MESSAGE.replace("{eventTitle}", event.eventType);
      // Send notification to the homeowner
      await notificationService.sendNotification({
        message: overDueMessage,
        recipientId: event.homeowner,
        recipientType: "Homeowner",
        type: "event",
        url: "/home-owner/schedule",
      });

      // Check if there's a contractor, and send a notification to the contractor as well
      if (event.contractor) {
        await notificationService.sendNotification({
          message: overDueMessage,
          recipientId: event.contractor,
          recipientType: "Contractor",
          type: "event",
          url: "/contractor/schedule",
        });
      }
      
      // update the record in the database that user is notified
      event.notified = true;
      await event.save();
    }
  });
};

export default sendOverdueNotifications;
