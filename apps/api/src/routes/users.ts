import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { listCollectors } from "../controllers/userController.js";

export const usersRouter = Router();

usersRouter.get("/collectors", requireAuth, requireRole("admin"), listCollectors);
