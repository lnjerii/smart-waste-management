import { Router } from "express";
import { ingestTelemetry } from "../controllers/telemetryController.js";
import { requireDeviceToken } from "../middlewares/deviceAuth.js";

export const telemetryRouter = Router();

telemetryRouter.post("/", requireDeviceToken, ingestTelemetry);
