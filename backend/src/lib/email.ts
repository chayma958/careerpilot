import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function send(to: string, subject: string, html: string) {
  if (!resend) return;
  const { error } = await resend.emails.send({ from: process.env.EMAIL_FROM as string, to, subject, html });
  if (error) {
    console.error(`[email] Resend failed to send to ${to}:`, error);
  }
}

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${process.env.CLIENT_URL}/verify-email/${token}`;
  console.log(`[email] verification link for ${to}: ${link}`);
  await send(to, "Verify your CareerPilot account", `<p>Click <a href="${link}">here</a> to verify your email.</p>`);
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
  console.log(`[email] password reset link for ${to}: ${link}`);
  await send(
    to,
    "Reset your CareerPilot password",
    `<p>Click <a href="${link}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  );
}

export async function sendNotificationEmail(to: string, subject: string, message: string) {
  console.log(`[email] notification for ${to}: ${message}`);
  await send(to, `CareerPilot: ${subject}`, `<p>${message}</p>`);
}
