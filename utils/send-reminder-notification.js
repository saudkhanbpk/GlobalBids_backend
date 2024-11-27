import cron from "node-cron";
import Reminder from "../model/reminder.model.js";

const sendReminderNotificationOnOverDue = () => {
  cron.schedule("* * * * *", async () => {
    const reminders  = await Reminder.find({renewalDate})
  });
};

export default sendReminderNotificationOnOverDue;
