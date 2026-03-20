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

export const sendPasswordResetEmail = async (toEmail, resetLink) => {
  await mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: `My-Task <noreply@${process.env.MAILGUN_DOMAIN}>`,
    to: [toEmail],
    subject: 'Password Reset Link',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>An administrator has requested to reset your password. Click the link below to create a new password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 1 hour.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          If you did not request a password reset, please ignore this email.
        </p>
      </div>
    `,
  });
};
