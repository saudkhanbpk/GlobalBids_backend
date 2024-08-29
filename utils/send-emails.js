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

async function sendEmail(mailOptions) {
  const info = await transporter.sendMail({
    from: "saudkhanbpk@gmail.com",
    ...mailOptions,
  });

  console.log("Message sent: %s", info.messageId);
}

const mailOptions = {
  to: "naeemkhan9293g@gmail.com",
  subject: "VERIFICATION-OTP",
  html: "<b>HTML TEXT</b>",
};

await sendEmail(mailOptions);
