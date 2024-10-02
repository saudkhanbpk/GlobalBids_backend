import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const email = process.env.EMAIL;
const appPassword = process.env.APP_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: email,
    pass: appPassword,
  },
});

export async function sendEmail(mailOptions) {
  const info = await transporter.sendMail({
    from: email,
    ...mailOptions,
  });
}
