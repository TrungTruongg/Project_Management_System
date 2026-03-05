import 'dotenv/config';
import nodemailer from 'nodemailer';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

export const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILGUN_USER, 
    pass: process.env.MAILGUN_PASSWORD,
  },
});

export const sendVerificationEmail = async (toEmail, verificationCode) => {
  await mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: `My-Task <noreply@${process.env.MAILGUN_DOMAIN}>`,
    to: [toEmail],
    subject: 'Verification Code',
    html: `
      <p>Your verification code is: <strong>${verificationCode}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `,
  });
};

export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
