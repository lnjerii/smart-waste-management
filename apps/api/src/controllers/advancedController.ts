import { Request, Response } from "express";
import { z } from "zod";
import { BinModel } from "../models/Bin.js";
import { TelemetryRecordModel } from "../models/TelemetryRecord.js";
import { IllegalDumpingEventModel } from "../models/IllegalDumpingEvent.js";
import { RecyclingRecordModel } from "../models/RecyclingRecord.js";
import { FuelLogModel } from "../models/FuelLog.js";
import { CitizenRewardModel } from "../models/CitizenReward.js";
import { EmergencyEventModel } from "../models/EmergencyEvent.js";
import { CitizenReportModel } from "../models/CitizenReport.js";
import { RoutePlanModel } from "../models/RoutePlan.js";
import { DroneScanModel } from "../models/DroneScan.js";
import { BlockchainTraceModel } from "../models/BlockchainTrace.js";
import { TruckTelemetryModel } from "../models/TruckTelemetry.js";

function subDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() - days);
  return next;
}

function startOfDay(base: Date) {
  const next = new Date(base);
  next.setHours(0, 0, 0, 0);
  return next;
}

function hasLocation(item: { location?: { lat?: number; lng?: number } | null }) {
  return !!item.location && typeof item.location.lat === "number" && typeof item.location.lng === "number";
}

const illegalDumpingSchema = z.object({
  imageUrl: z.string().url(),
  location: z.object({ lat: z.number(), lng: z.number() }),
  confidence: z.number().min(0).max(1),
  detectedByModel: z.string().min(1),
  numberPlate: z.string().optional()
});

const recyclingSchema = z.object({
  category: z.enum(["plastic", "organic", "metal", "paper", "glass"]),
  weightKg: z.number().positive(),
  binId: z.string().optional(),
  area: z.string().min(2),
  source: z.enum(["ai_camera", "manual", "collector"]).default("manual")
});

const fuelSchema = z.object({
  truckId: z.string().min(1),
  liters: z.number().positive(),
  distanceKm: z.number().positive(),
  routeOptimized: z.boolean().default(true)
});

const rewardSchema = z.object({
  email: z.string().email(),
  points: z.number().int().positive(),
  source: z.enum(["reporting", "recycling", "cleanup_event"]),
  redeemedVia: z.enum(["mpesa", "airtime", "discount"]).default("airtime")
});

const emergencySchema = z.object({
  type: z.enum(["flood", "blocked_drainage", "floating_bin", "fire"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  location: z.object({ lat: z.number(), lng: z.number() }),
  weather: z.string().optional()
});

const droneScanSchema = z.object({
  landfillSite: z.string().min(1),
  riskLevel: z.enum(["low", "medium", "high"]),
  notes: z.string().optional(),
  imageUrl: z.string().url().optional()
});

const blockchainTraceSchema = z.object({
  batchId: z.string().min(1),
  hash: z.string().min(10),
  actor: z.string().min(1),
  action: z.string().min(1)
});

const truckTelemetrySchema = z.object({
  truckId: z.string().min(1),
  engineTempC: z.number(),
  vibrationScore: z.number(),
  fuelEfficiencyKmPerL: z.number().positive(),
  odometerKm: z.number().nonnegative()
});

const chatbotSchema = z.object({
  query: z.string().min(2)
});

export async function addIllegalDumpingEvent(req: Request, res: Response) {
  const parsed = illegalDumpingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const event = await IllegalDumpingEventModel.create(parsed.data);
  return res.status(201).json({ event });
}

export async function addRecyclingRecord(req: Request, res: Response) {
  const parsed = recyclingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const record = await RecyclingRecordModel.create(parsed.data);
  return res.status(201).json({ record });
}

export async function addFuelLog(req: Request, res: Response) {
  const parsed = fuelSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const fuelLog = await FuelLogModel.create(parsed.data);
  return res.status(201).json({ fuelLog });
}

export async function grantRewardPoints(req: Request, res: Response) {
  const parsed = rewardSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const reward = await CitizenRewardModel.create(parsed.data);
  return res.status(201).json({ reward });
}

export async function addEmergencyEvent(req: Request, res: Response) {
  const parsed = emergencySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const emergency = await EmergencyEventModel.create(parsed.data);
  return res.status(201).json({ emergency });
}

export async function addDroneScan(req: Request, res: Response) {
  const parsed = droneScanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const scan = await DroneScanModel.create(parsed.data);
  return res.status(201).json({ scan });
}

export async function addBlockchainTrace(req: Request, res: Response) {
  const parsed = blockchainTraceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const trace = await BlockchainTraceModel.create(parsed.data);
  return res.status(201).json({ trace });
}

export async function addTruckTelemetry(req: Request, res: Response) {
  const parsed = truckTelemetrySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const telemetry = await TruckTelemetryModel.create(parsed.data);
  return res.status(201).json({ telemetry });
}

export async function chatbotAssistant(req: Request, res: Response) {
  const parsed = chatbotSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const text = parsed.data.query.toLowerCase();
  let answer = "I can help with reporting overflow bins, route status, and recycling guidance.";

  if (text.includes("report")) answer = "Open Citizen Portal and submit location + photo for faster response.";
  if (text.includes("route")) answer = "Collectors can view assigned route in the Collector Portal.";
  if (text.includes("recycle")) answer = "Use category bins: plastic, organic, metal, paper, glass.";

  return res.json({ answer, source: "rule-based-chatbot" });
}

export async function getHeatmap(req: Request, res: Response) {
  const days = Number(req.query.days ?? 14);
  const since = subDays(new Date(), Number.isFinite(days) ? days : 14);

  const records = await TelemetryRecordModel.find({ recordedAt: { $gte: since } })
    .select("location fillLevel")
    .limit(5000);

  const buckets = new Map<string, { lat: number; lng: number; intensity: number }>();

  for (const item of records) {
    const rawLat = Number(item.location?.lat);
    const rawLng = Number(item.location?.lng);
    if (!Number.isFinite(rawLat) || !Number.isFinite(rawLng)) continue;
    const lat = Math.round(rawLat * 100) / 100;
    const lng = Math.round(rawLng * 100) / 100;
    const key = `${lat}:${lng}`;
    const existing = buckets.get(key) ?? { lat, lng, intensity: 0 };
    existing.intensity += item.fillLevel;
    buckets.set(key, existing);
  }

  return res.json({ points: [...buckets.values()] });
}

export async function getPublicTransparency(_req: Request, res: Response) {
  const [totalRoutes, completedRoutes, totalReports, resolvedReports] = await Promise.all([
    RoutePlanModel.countDocuments(),
    RoutePlanModel.countDocuments({ status: "completed" }),
    CitizenReportModel.countDocuments(),
    CitizenReportModel.countDocuments({ status: "resolved" })
  ]);

  const routeCompletionRate = totalRoutes ? (completedRoutes / totalRoutes) * 100 : 0;
  const reportResolutionRate = totalReports ? (resolvedReports / totalReports) * 100 : 0;
  const cleanlinessIndex = Math.round((routeCompletionRate * 0.55 + reportResolutionRate * 0.45) * 100) / 100;

  return res.json({
    routeCompletionRate: Number(routeCompletionRate.toFixed(2)),
    reportResolutionRate: Number(reportResolutionRate.toFixed(2)),
    cleanlinessIndex
  });
}

export async function getAdvancedOverview(_req: Request, res: Response) {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const fourteenDaysAgo = subDays(now, 14);
  const sevenDaysAgo = subDays(now, 7);
  const oneDayAgo = subDays(now, 1);

  const [
    bins,
    recentTelemetry,
    illegalEvents,
    recyclingRecords,
    fuelLogs,
    rewardLogs,
    emergencyEvents,
    droneScans,
    traces,
    truckTelemetry
  ] = await Promise.all([
    BinModel.find().limit(2000),
    TelemetryRecordModel.find({ recordedAt: { $gte: fourteenDaysAgo } }).sort({ recordedAt: -1 }).limit(8000),
    IllegalDumpingEventModel.find({ createdAt: { $gte: thirtyDaysAgo } }),
    RecyclingRecordModel.find({ createdAt: { $gte: thirtyDaysAgo } }),
    FuelLogModel.find({ createdAt: { $gte: thirtyDaysAgo } }),
    CitizenRewardModel.find({ createdAt: { $gte: thirtyDaysAgo } }),
    EmergencyEventModel.find({ createdAt: { $gte: thirtyDaysAgo } }),
    DroneScanModel.find({ createdAt: { $gte: thirtyDaysAgo } }),
    BlockchainTraceModel.find({ createdAt: { $gte: thirtyDaysAgo } }),
    TruckTelemetryModel.find({ createdAt: { $gte: sevenDaysAgo } })
  ]);

  const dayCounts = new Map<string, number>();
  const wardCounts = new Map<string, number>();
  const nextCriticalBins: Array<{ binId: string; etaHours: number; currentFill: number }> = [];

  for (const sample of recentTelemetry) {
    const rawLat = Number(sample.location?.lat);
    const rawLng = Number(sample.location?.lng);
    if (!Number.isFinite(rawLat) || !Number.isFinite(rawLng)) continue;
    const day = startOfDay(sample.recordedAt).toISOString();
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    const wardKey = `${Math.round(rawLat * 100) / 100}:${Math.round(rawLng * 100) / 100}`;
    wardCounts.set(wardKey, (wardCounts.get(wardKey) ?? 0) + 1);
  }

  const peakDays = [...dayCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([day]) => day.slice(0, 10));

  const hotspots = [...wardCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ward, count]) => ({ ward, activityScore: count }));

  for (const bin of bins) {
    if (bin.fillLevel >= 90) continue;
    const binRecords = recentTelemetry.filter((t) => t.binId === bin.binId).slice(0, 20);
    if (binRecords.length < 3) continue;
    const first = binRecords[binRecords.length - 1];
    const latest = binRecords[0];
    const hours = Math.max((latest.recordedAt.getTime() - first.recordedAt.getTime()) / (1000 * 60 * 60), 1);
    const slope = (latest.fillLevel - first.fillLevel) / hours;
    if (slope <= 0.1) continue;
    const etaHours = (90 - latest.fillLevel) / slope;
    if (etaHours > 0 && etaHours < 96) {
      nextCriticalBins.push({ binId: bin.binId, etaHours: Number(etaHours.toFixed(1)), currentFill: latest.fillLevel });
    }
  }

  nextCriticalBins.sort((a, b) => a.etaHours - b.etaHours);

  const dumpingWithPlate = illegalEvents.filter((e) => !!e.numberPlate).length;

  const totalRecyclableKg = recyclingRecords.reduce((sum, r) => sum + r.weightKg, 0);
  const byType = recyclingRecords.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + r.weightKg;
    return acc;
  }, {});
  const estimatedTotalWaste = totalRecyclableKg * 1.8;
  const recyclingRate = estimatedTotalWaste > 0 ? (totalRecyclableKg / estimatedTotalWaste) * 100 : 0;

  const totalFuel = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
  const co2Kg = totalFuel * 2.68;
  const optimizedFuel = fuelLogs.filter((f) => f.routeOptimized).reduce((sum, f) => sum + f.liters, 0);
  const baselineFuel = optimizedFuel * 1.25 + (totalFuel - optimizedFuel);
  const reductionPct = baselineFuel > 0 ? ((baselineFuel - totalFuel) / baselineFuel) * 100 : 0;

  const organicKg = byType.organic ?? 0;
  const potentialBiogasM3 = organicKg * 0.07;
  const potentialEnergyKWh = potentialBiogasM3 * 6;

  const rewardsByEmail = rewardLogs.reduce<Record<string, number>>((acc, r) => {
    acc[r.email] = (acc[r.email] ?? 0) + r.points;
    return acc;
  }, {});
  const leaderboard = Object.entries(rewardsByEmail)
    .map(([email, points]) => ({ email, points }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  const openEmergency = emergencyEvents.filter((e) => e.status === "open");
  const floodWarnings = openEmergency.filter((e) => e.type === "flood").length;

  const totalRoutes = await RoutePlanModel.countDocuments();
  const completedRoutes = await RoutePlanModel.countDocuments({ status: "completed" });
  const missedCollections = await RoutePlanModel.countDocuments({ status: { $in: ["assigned", "in_progress"] }, createdAt: { $lt: oneDayAgo } });
  const avgRating = Math.max(1, Math.min(5, 3 + (completedRoutes / Math.max(totalRoutes, 1)) * 2));
  const cleanlinessIndex = Number(((completedRoutes / Math.max(totalRoutes, 1)) * 70 + (1 - missedCollections / Math.max(totalRoutes, 1)) * 30).toFixed(2));

  const lowBatteryBins = bins.filter((b) => (b.batteryLevel ?? 100) < 25).length;
  const offlineBins = bins.filter((b) => b.lastSeenAt.getTime() < oneDayAgo.getTime()).length;
  const sensorFaultBins = bins.filter((b) => b.temperatureC < -5 || b.temperatureC > 120).length;
  const healthyBins = Math.max(bins.length - (lowBatteryBins + offlineBins + sensorFaultBins), 0);

  const analyticsClients = 4;
  const subscriptionTiers = ["County Basic", "County Pro", "Enterprise"];
  const estMonthlyRevenueKes = Number((analyticsClients * 180000 + totalRecyclableKg * 12).toFixed(2));

  const chatbotQueries = rewardLogs.length + emergencyEvents.length + illegalEvents.length;
  const maintenanceAtRisk = truckTelemetry
    .filter((t) => t.engineTempC > 105 || t.vibrationScore > 7 || t.fuelEfficiencyKmPerL < 2.5)
    .map((t) => t.truckId);

  const heatmapPoints = [...wardCounts.entries()].slice(0, 20).map(([ward, value]) => ({ ward, value }));

  return res.json({
    prediction: {
      hotspots,
      peakDays,
      nextCriticalBins: nextCriticalBins.slice(0, 10)
    },
    illegalDumping: {
      detectedLast30d: illegalEvents.length,
      withNumberPlates: dumpingWithPlate
    },
    recycling: {
      totalRecyclableKg: Number(totalRecyclableKg.toFixed(2)),
      byType,
      recyclingRatePct: Number(recyclingRate.toFixed(2))
    },
    carbon: {
      totalFuelLiters: Number(totalFuel.toFixed(2)),
      co2Kg: Number(co2Kg.toFixed(2)),
      reductionPct: Number(reductionPct.toFixed(2))
    },
    wasteToEnergy: {
      organicKg: Number(organicKg.toFixed(2)),
      potentialBiogasM3: Number(potentialBiogasM3.toFixed(2)),
      potentialEnergyKWh: Number(potentialEnergyKWh.toFixed(2))
    },
    incentives: {
      participants: Object.keys(rewardsByEmail).length,
      totalPoints: rewardLogs.reduce((sum, r) => sum + r.points, 0),
      leaderboard
    },
    emergency: {
      activeEvents: openEmergency.length,
      floodWarnings
    },
    transparency: {
      cleanlinessIndex,
      missedCollections,
      avgRating: Number(avgRating.toFixed(2))
    },
    binHealth: {
      healthyBins,
      lowBatteryBins,
      offlineBins,
      sensorFaultBins
    },
    business: {
      analyticsClients,
      estMonthlyRevenueKes,
      subscriptionTiers
    },
    nextLevel: {
      chatbotQueries,
      droneScans: droneScans.length,
      blockchainTraces: traces.length,
      truckMaintenanceRiskCount: maintenanceAtRisk.length,
      truckMaintenanceRisk: Array.from(new Set(maintenanceAtRisk)),
      heatmapPoints
    }
  });
}
