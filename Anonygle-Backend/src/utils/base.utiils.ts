import { ROLES } from "src/types/base.type";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { Response } from "express";
import { globalSettings } from "src/config/settings.config";

export const generateId = (length: number = 20): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

export function setCookie(token: string, res: Response) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: globalSettings.WORK_ENVIRONMENT === "production",
    maxAge: 60 * 60 * 24 * 1000,
    sameSite: "strict",
  });
}

export function clearCookie(res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: globalSettings.WORK_ENVIRONMENT === "production",
    maxAge: 60 * 60 * 24 * 1000,
    sameSite: "strict",
    expires: new Date(Date.now() - 1000),
  });
}

export function hashPassword(password: string): string {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
}

export function verifyHash(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(
  secret: string,
  payload: { user: { userId: string; role: ROLES } },
  expiry: number = 60 * 60 * 24,
): string {
  return jwt.sign(payload, secret, { expiresIn: expiry });
}
