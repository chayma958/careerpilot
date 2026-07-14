import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function signAuthToken(userId: string, rememberMe: boolean) {
  const expiresIn = rememberMe ? "30d" : "1d";
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
}
