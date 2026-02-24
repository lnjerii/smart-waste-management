import { Router } from "express";
import { requireAuth, requireRole, attachAuthIfPresent } from "../middlewares/auth.js";
import {
  createReport,
  getMyReports,
  listReports,
  updateReportStatus
} from "../controllers/reportController.js";

export const reportsRouter = Router();

reportsRouter.post("/", attachAuthIfPresent, createReport);
reportsRouter.get("/my", requireAuth, requireRole("citizen", "admin", "collector"), getMyReports);
reportsRouter.get("/", requireAuth, requireRole("admin", "collector"), listReports);
reportsRouter.patch("/:reportId/status", requireAuth, requireRole("admin", "collector"), updateReportStatus);
