import nodemailer from "nodemailer";
import { logger } from "./logger";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendMail(options: MailOptions): Promise<void> {
  if (!process.env.EMAIL_HOST) {
    logger.info(
      { to: options.to, subject: options.subject },
      `[DEV EMAIL]\n${options.html}`,
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT ?? 587),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER ?? "no-reply@beacontrust.com",
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  await sendMail({
    to,
    subject: "Reset Your Password – Beacon Trust",
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
}

export async function sendWelcomeEmail(
  to: string,
  firstName: string,
): Promise<void> {
  await sendMail({
    to,
    subject: "Welcome to Beacon Trust",
    html: `
      <h2>Welcome, ${firstName}!</h2>
      <p>Your Beacon Trust account has been created successfully.</p>
      <p>You can now log in and start managing your finances.</p>
    `,
  });
}

export async function sendTransactionEmail(
  to: string,
  txDetails: { amount: string; type: string; description?: string | null },
): Promise<void> {
  await sendMail({
    to,
    subject: "Transaction Notification – Beacon Trust",
    html: `
      <h2>Transaction Alert</h2>
      <p>A ${txDetails.type} transaction of <strong>${txDetails.amount}</strong> has been processed on your account.</p>
      ${txDetails.description ? `<p>Description: ${txDetails.description}</p>` : ""}
    `,
  });
}

export { sendMail };
