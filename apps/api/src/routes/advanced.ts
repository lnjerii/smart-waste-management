import { Router } from "express";
import {
  addBlockchainTrace,
  addDroneScan,
  addEmergencyEvent,
  addFuelLog,
  addIllegalDumpingEvent,
  addRecyclingRecord,
  addTruckTelemetry,
  chatbotAssistant,
  getAdvancedOverview,
  getHeatmap,
  getPublicTransparency,
  grantRewardPoints
} from "../controllers/advancedController.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

export const advancedRouter = Router();

advancedRouter.get("/overview", requireAuth, requireRole("admin"), getAdvancedOverview);
advancedRouter.get("/heatmap", requireAuth, requireRole("admin", "collector"), getHeatmap);
advancedRouter.get("/transparency/public", getPublicTransparency);

advancedRouter.post("/illegal-dumping", requireAuth, requireRole("admin", "collector"), addIllegalDumpingEvent);
advancedRouter.post("/recycling", requireAuth, requireRole("admin", "collector"), addRecyclingRecord);
advancedRouter.post("/fuel", requireAuth, requireRole("admin", "collector"), addFuelLog);
advancedRouter.post("/rewards", requireAuth, requireRole("admin"), grantRewardPoints);
advancedRouter.post("/emergency", requireAuth, requireRole("admin", "collector", "citizen"), addEmergencyEvent);
advancedRouter.post("/drone-scan", requireAuth, requireRole("admin"), addDroneScan);
advancedRouter.post("/blockchain-trace", requireAuth, requireRole("admin"), addBlockchainTrace);
advancedRouter.post("/truck-telemetry", requireAuth, requireRole("admin", "collector"), addTruckTelemetry);
advancedRouter.post("/chatbot", requireAuth, requireRole("admin", "collector", "citizen"), chatbotAssistant);
