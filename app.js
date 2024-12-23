import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes.js";
import { connectDB } from "./config/db.js";
import errorHandler from "./error/errorHandler.js";
import { RouteNotFoundError } from "./error/AppError.js";
import jobsRouter from "./routes/jobs.routes.js";
import contractorRouter from "./routes/contractor.routes.js";
import homeownerRoutes from "./routes/homeowner.routes.js";
import bidRouter from "./routes/bid.routes.js";
import storyRouter from "./routes/story.routes.js";
import initSocket from "./event/site-events.js";
import chatRouter from "./routes/chat.routes.js";
import eventRouter from "./routes/event.routes.js";
import notificationRouter from "./routes/notifications.routes.js";
import oAuthRoutes from "./routes/auth.google.routes.js";
import passport from "./config/passport.config.js";
import reminderRouter from "./routes/reminder.routes.js";
import fileUploadRouter from "./routes/file.upload.routes.js";
import NotificationService from "./services/notification.service.js";
import "dotenv/config.js";
import cookieParser from "cookie-parser";
import { handleStripeWebhook } from "./controller/stripe.controller.js";
import sendOverdueNotifications from "./services/sendOverdueNotification.service.js";

dotenv.config();
const app = express();
app.use(express.static("public"));
connectDB();
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleStripeWebhook
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(errorHandler);

app.get("/", (_req, res) => {
  return res.status(200).json({ message: "Hello GlobalBids!" });
});

app.use(passport.initialize());

app.use(oAuthRoutes);
app.use("/api/auth/", authRoutes);
app.use("/api/job/", jobsRouter);
app.use("/api/contractor/", contractorRouter);
app.use("/api/homeowner/", homeownerRoutes);
app.use("/api/bid/", bidRouter);
app.use("/api/chat/", chatRouter);
app.use("/api/event/", eventRouter);
app.use("/api/story/", storyRouter);
app.use("/api/notifications/", notificationRouter);
app.use("/api/reminders/", reminderRouter);
app.use("/api/file/upload", fileUploadRouter);

app.all("*", (req, _res, next) => {
  const err = new RouteNotFoundError(
    `Can't find ${req.originalUrl} on the server!`
  );
  return next(err);
});
app.use(errorHandler);

const port = process.env.PORT;
const server = http.createServer(app);
const io = initSocket(server);

sendOverdueNotifications(io);

app.set("io", io);
// creating notification instance so that it can send notifications to the users
const notificationService = new NotificationService(io);
app.set("notificationService", notificationService);

server.listen(port, () => {
  console.log(`\nserver is running on the port ${port}`);
});
