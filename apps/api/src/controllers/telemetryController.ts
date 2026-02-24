import { Request, Response } from "express";
import { telemetrySchema } from "../utils/validators.js";
import { BinModel } from "../models/Bin.js";
import { evaluateAlerts } from "../services/alertService.js";
import { io } from "../sockets/io.js";

export async function ingestTelemetry(req: Request, res: Response) {
  const parsed = telemetrySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const payload = parsed.data;
  const lastSeenAt = payload.timestamp ? new Date(payload.timestamp) : new Date();

  const bin = await BinModel.findOneAndUpdate(
    { binId: payload.binId },
    {
      binId: payload.binId,
      fillLevel: payload.fillLevel,
      temperatureC: payload.temperatureC,
      batteryLevel: payload.batteryLevel,
      location: payload.location,
      lastSeenAt
    },
    { upsert: true, new: true }
  );

  const alerts = await evaluateAlerts({
    binId: payload.binId,
    fillLevel: payload.fillLevel,
    temperatureC: payload.temperatureC
  });

  io.emit("bin.updated", bin);
  alerts.forEach((alert) => io.emit("alert.created", alert));

  return res.status(202).json({ status: "accepted", alertsCreated: alerts.length });
}
