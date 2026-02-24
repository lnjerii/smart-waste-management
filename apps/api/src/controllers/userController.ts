import { Request, Response } from "express";
import { UserModel } from "../models/User.js";

export async function listCollectors(_req: Request, res: Response) {
  const collectors = await UserModel.find({ role: "collector" }).select("name email role").sort({ createdAt: -1 });
  return res.json({ collectors });
}
