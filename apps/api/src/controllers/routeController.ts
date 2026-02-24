import { Request, Response } from "express";
import { z } from "zod";
import { BinModel } from "../models/Bin.js";
import { env } from "../config/env.js";
import { RoutePlanModel } from "../models/RoutePlan.js";
import { CollectionEventModel } from "../models/CollectionEvent.js";

type OptimizeRequest = {
  depot: { lat: number; lng: number };
  bins: Array<{ binId: string; location: { lat: number; lng: number }; priority: number }>;
};

const generateRouteSchema = z.object({
  collectorId: z.string().optional(),
  depot: z.object({ lat: z.number(), lng: z.number() }).optional()
});

const stopStatusSchema = z.object({
  status: z.enum(["collected", "skipped", "damaged"]),
  note: z.string().max(500).optional()
});

function hasLocation(bin: { location?: { lat?: number; lng?: number } | null }): bin is { location: { lat: number; lng: number } } {
  return !!bin.location && typeof bin.location.lat === "number" && typeof bin.location.lng === "number";
}

export async function generateRoute(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });

  const parsed = generateRouteSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const bins = await BinModel.find({ fillLevel: { $gte: env.fillWarning } }).select("binId location fillLevel temperatureC");

  const eligibleBins = bins.filter(hasLocation);

  if (eligibleBins.length === 0) {
    return res.status(200).json({ algorithm: "none", stops: [], message: "No bins above threshold." });
  }

  const payload: OptimizeRequest = {
    depot: parsed.data.depot ?? { lat: -1.286389, lng: 36.817223 },
    bins: eligibleBins.map((b) => ({
      binId: b.binId,
      location: { lat: Number(b.location?.lat), lng: Number(b.location?.lng) },
      priority: b.fillLevel >= env.fillCritical || b.temperatureC >= env.tempCritical ? 2 : 1
    }))
  };

  const response = await fetch(`${env.optimizerUrl}/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    return res.status(502).json({ error: "Optimizer service unavailable" });
  }

  const plan = (await response.json()) as { algorithm: string; stops: string[] };

  const stops = plan.stops.map((binId, index) => ({
    binId,
    order: index + 1,
    status: "pending" as const
  }));

  const routePlan = await RoutePlanModel.create({
    collectorId: parsed.data.collectorId,
    generatedBy: req.user.userId,
    algorithm: plan.algorithm,
    status: "assigned",
    stops
  });

  return res.status(201).json({
    routeId: routePlan.id,
    algorithm: routePlan.algorithm,
    stops: routePlan.stops,
    assignedCollectorId: routePlan.collectorId
  });
}

export async function listRoutes(_req: Request, res: Response) {
  const routes = await RoutePlanModel.find()
    .populate("collectorId", "name email role")
    .populate("generatedBy", "name email role")
    .sort({ createdAt: -1 })
    .limit(100);

  return res.json({ routes });
}

export async function getMyActiveRoute(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });

  const route = await RoutePlanModel.findOne({ collectorId: req.user.userId })
    .sort({ createdAt: -1 })
    .populate("generatedBy", "name email role");

  if (!route) {
    return res.status(404).json({ error: "No route assigned" });
  }

  return res.json({ route });
}

export async function updateStopStatus(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });

  const parsed = stopStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const route = await RoutePlanModel.findById(req.params.routeId);
  if (!route) return res.status(404).json({ error: "Route not found" });

  if (req.user.role === "collector" && String(route.collectorId ?? "") !== req.user.userId) {
    return res.status(403).json({ error: "Route is not assigned to this collector" });
  }

  const stop = route.stops.find((s) => s.binId === req.params.binId);
  if (!stop) return res.status(404).json({ error: "Stop not found" });

  stop.status = parsed.data.status;
  stop.note = parsed.data.note;
  stop.completedAt = new Date();

  if (!route.startedAt) {
    route.startedAt = new Date();
    route.status = "in_progress";
  }

  const pendingLeft = route.stops.some((s) => s.status === "pending");
  if (!pendingLeft) {
    route.status = "completed";
    route.completedAt = new Date();
  }

  await route.save();

  await CollectionEventModel.create({
    routePlanId: route.id,
    collectorId: req.user.userId,
    binId: req.params.binId,
    action: parsed.data.status,
    note: parsed.data.note
  });

  return res.json({ route });
}

