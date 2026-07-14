import { api } from "../lib/api";
import type { User } from "../types";

export interface AuthResponse {
  token: string;
  user: User;
}

export async function signup(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const res = await api.post<{ user: User }>("/auth/signup", data);
  return res.data;
}

export async function login(data: { email: string; password: string; rememberMe: boolean }) {
  const res = await api.post<AuthResponse>("/auth/login", data);
  return res.data;
}

export async function fetchMe() {
  const res = await api.get<{ user: User }>("/auth/me");
  return res.data.user;
}

export async function forgotPassword(email: string) {
  const res = await api.post<{ message: string }>("/auth/forgot-password", { email });
  return res.data;
}

export async function resendVerification(email: string) {
  const res = await api.post<{ message: string }>("/auth/resend-verification", { email });
  return res.data;
}

export async function resetPassword(token: string, password: string, confirmPassword: string) {
  const res = await api.post<{ message: string }>(`/auth/reset-password/${token}`, {
    password,
    confirmPassword,
  });
  return res.data;
}

export async function verifyEmail(token: string) {
  const res = await api.get<{ message: string }>(`/auth/verify-email/${token}`);
  return res.data;
}
