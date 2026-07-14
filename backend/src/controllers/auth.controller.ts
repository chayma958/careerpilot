import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { signAuthToken } from "../lib/jwt";
import { sendPasswordResetEmail, sendVerificationEmail } from "../lib/email";
import { AuthedRequest } from "../middleware/auth";
import {
  forgotPasswordSchema,
  loginSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  signupSchema,
} from "../validation/auth.schema";

function toPublicUser(user: { id: string; name: string; email: string; verified: boolean }) {
  return { id: user.id, name: user.name, email: user.email, verified: user.verified };
}

export async function signup(req: Request, res: Response) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, verificationToken, verificationTokenExpiry },
  });

  await sendVerificationEmail(user.email, verificationToken);

  return res.status(201).json({ user: toPublicUser(user) });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password, rememberMe } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (!user.password) {
    return res.status(401).json({
      error: "This account uses Google sign-in. Continue with that provider instead.",
    });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (!user.verified) {
    return res.status(403).json({ error: "Please verify your email before logging in", code: "EMAIL_NOT_VERIFIED" });
  }

  const token = signAuthToken(user.id, rememberMe);

  return res.json({ token, user: toPublicUser(user) });
}

export async function logout(_req: Request, res: Response) {
  return res.status(204).send();
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.params;

  const user = await prisma.user.findUnique({ where: { verificationToken: token } });
  if (!user || !user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
    return res.status(400).json({ error: "Invalid or expired verification link" });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { verified: true, verificationToken: null, verificationTokenExpiry: null },
  });

  return res.json({ message: "Email verified successfully" });
}

export async function resendVerification(req: Request, res: Response) {
  const parsed = resendVerificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user && !user.verified) {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.user.update({ where: { id: user.id }, data: { verificationToken, verificationTokenExpiry } });
    await sendVerificationEmail(user.email, verificationToken);
  }

  return res.json({ message: "If an unverified account exists for that email, a new link has been sent" });
}

export async function forgotPassword(req: Request, res: Response) {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.password) {
    return res.status(400).json({
      error: "This account uses Google sign-in and has no password to reset. Continue with that provider instead.",
    });
  }

  if (user && user.password) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExpiry } });
    await sendPasswordResetEmail(user.email, resetToken);
  }

  return res.json({ message: "If an account exists for that email, a reset link has been sent" });
}

export async function resetPassword(req: Request, res: Response) {
  const { token } = req.params;
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const user = await prisma.user.findUnique({ where: { resetToken: token } });
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return res.status(400).json({ error: "Invalid or expired reset link" });
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
  });

  return res.json({ message: "Password reset successfully" });
}

export async function me(req: AuthedRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json({ user: toPublicUser(user) });
}
