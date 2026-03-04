import 'dotenv/config';
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILGUN_USER, 
    pass: process.env.MAILGUN_PASSWORD,
  },
});

export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
