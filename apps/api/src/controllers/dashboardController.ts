import { Request, Response } from "express";
import { BinModel } from "../models/Bin.js";
import { AlertModel } from "../models/Alert.js";
import { RoutePlanModel } from "../models/RoutePlan.js";
import { CitizenReportModel } from "../models/CitizenReport.js";

export async function getLiveOverview(_req: Request, res: Response) {
  const [bins, activeAlerts, openRoutes, openReports] = await Promise.all([
    BinModel.find().sort({ updatedAt: -1 }).limit(500),
    AlertModel.find({ isResolved: false }).sort({ createdAt: -1 }).limit(200),
    RoutePlanModel.countDocuments({ status: { $in: ["assigned", "in_progress"] } }),
    CitizenReportModel.countDocuments({ status: { $in: ["open", "in_review"] } })
  ]);

  return res.json({ bins, activeAlerts, metrics: { openRoutes, openReports } });
}
