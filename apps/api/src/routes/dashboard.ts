import { Router } from "express";
import { getLiveOverview } from "../controllers/dashboardController.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

export const dashboardRouter = Router();

dashboardRouter.get("/overview", requireAuth, requireRole("admin", "collector"), getLiveOverview);
