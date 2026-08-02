import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525', 10),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

/**
 * Generic email sender.
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"A² ReVamp Gym" <noreply@a2revampgym.com>',
      to,
      subject,
      html
    });
    logger.info(`Email sent: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    // Non-blocking in dev mode if SMTP isn't configured
    return null;
  }
};

/**
 * OTP Verification Email Template
 */
export const sendOTPEmail = async (email, name, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background: #f9f9f9;">
      <h2 style="color: #3b82f6;">A² ReVamp Gym — Email Verification</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your 6-digit OTP code for email verification is:</p>
      <div style="font-size: 28px; font-weight: bold; color: #06b6d4; letter-spacing: 4px; margin: 15px 0;">${otp}</div>
      <p>This OTP will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      <br/>
      <p>Best regards,<br/>A² ReVamp Gym Team</p>
    </div>
  `;
  return sendEmail({ to: email, subject: 'A² ReVamp Gym — Verify Your Email OTP', html });
};

/**
 * Password Reset Email Template
 */
export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background: #f9f9f9;">
      <h2 style="color: #ef4444;">A² ReVamp Gym — Password Reset</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0;">Reset Password</a>
      <p>This link is valid for 1 hour. If you did not request a password reset, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to: email, subject: 'A² ReVamp Gym — Password Reset Request', html });
};

/**
 * Membership Reminder Email Template
 */
export const sendMembershipReminderEmail = async (email, name, planName, expiryDate) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background: #f9f9f9;">
      <h2 style="color: #f59e0b;">A² ReVamp Gym — Membership Renewal Reminder</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your <strong>${planName}</strong> membership is set to expire on <strong>${expiryDate}</strong>.</p>
      <p>Renew today to maintain uninterrupted access to the workout floor, swimming pool, and sauna!</p>
      <br/>
      <p>Best regards,<br/>A² ReVamp Gym Team</p>
    </div>
  `;
  return sendEmail({ to: email, subject: 'A² ReVamp Gym — Membership Renewal Reminder', html });
};
