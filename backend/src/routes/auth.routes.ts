import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  me,
  resendVerification,
  resetPassword,
  signup,
  verifyEmail,
} from "../controllers/auth.controller";
import { googleAuth, googleCallback } from "../controllers/oauth.controller";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/verify-email/:token", verifyEmail);
authRouter.post("/resend-verification", resendVerification);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);
authRouter.get("/me", requireAuth, me);

authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleCallback);
