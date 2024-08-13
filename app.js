import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes.js";
import { connectDB } from "./config/db.js";
import errorHandler from "./error/errorHandler.js";
dotenv.config();

const app = express();
connectDB();
// app.use(express.json());
app.use(bodyParser.json());
app.use(cors({ origin: true }));
app.use(errorHandler);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Hello GlobalBids!" });
});

app.use("/api/auth/", authRoutes);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server is running on the port ${port}`);
});
