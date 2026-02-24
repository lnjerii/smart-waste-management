import { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

export function requireDeviceToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header("x-device-token");

  if (!env.iotDeviceToken || token !== env.iotDeviceToken) {
    return res.status(401).json({ error: "Invalid device token" });
  }

  return next();
}
