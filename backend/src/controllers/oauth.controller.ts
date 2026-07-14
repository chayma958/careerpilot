import crypto from "crypto";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { signAuthToken } from "../lib/jwt";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

const STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 5 * 60 * 1000,
  sameSite: "lax" as const,
};

function apiUrl() {
  return process.env.API_URL ?? "http://localhost:4000";
}

function clientUrl() {
  return process.env.CLIENT_URL ?? "http://localhost:5173";
}

interface OAuthProfile {
  providerId: string;
  email: string;
  name: string;
}

async function findOrCreateGoogleUser(profile: OAuthProfile) {
  const { providerId, email, name } = profile;

  const existingByProvider = await prisma.user.findFirst({ where: { googleId: providerId } });
  if (existingByProvider) return existingByProvider;

  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: { googleId: providerId, verified: true },
    });
  }

  return prisma.user.create({
    data: { name, email, verified: true, googleId: providerId },
  });
}

export function googleAuth(_req: Request, res: Response) {
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("oauth_state", state, STATE_COOKIE_OPTIONS);

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    redirect_uri: `${apiUrl()}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
}

export async function googleCallback(req: Request, res: Response) {
  const { code, state } = req.query;

  if (!code || !state || state !== req.cookies.oauth_state) {
    return res.redirect(`${clientUrl()}/login?error=oauth_failed`);
  }
  res.clearCookie("oauth_state");

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: code as string,
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirect_uri: `${apiUrl()}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    return res.redirect(`${clientUrl()}/login?error=oauth_failed`);
  }
  const tokenData = (await tokenRes.json()) as { access_token: string };

  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!profileRes.ok) {
    return res.redirect(`${clientUrl()}/login?error=oauth_failed`);
  }
  const profile = (await profileRes.json()) as { sub: string; email: string; name: string };

  const user = await findOrCreateGoogleUser({
    providerId: profile.sub,
    email: profile.email,
    name: profile.name,
  });

  const jwt = signAuthToken(user.id, true);
  return res.redirect(`${clientUrl()}/oauth/callback?token=${jwt}`);
}
