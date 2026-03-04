import 'dotenv/config';
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
