import { Request, Response } from "express";
import { z } from "zod";
import { CitizenReportModel } from "../models/CitizenReport.js";

const createReportSchema = z.object({
  type: z.enum(["overflow", "damaged_bin", "illegal_dumping", "new_bin_request"]),
  description: z.string().min(5).max(2000),
  location: z.object({ lat: z.number(), lng: z.number() }),
  photoUrl: z.string().url().optional(),
  reporterName: z.string().min(2).max(120).optional(),
  reporterEmail: z.string().email().optional()
});

const updateStatusSchema = z.object({
  status: z.enum(["open", "in_review", "resolved", "rejected"])
});

export async function createReport(req: Request, res: Response) {
  const parsed = createReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const report = await CitizenReportModel.create({
    ...parsed.data,
    reporterId: req.user?.userId
  });

  return res.status(201).json({ report });
}

export async function getMyReports(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });

  const reports = await CitizenReportModel.find({ reporterId: req.user.userId }).sort({ createdAt: -1 }).limit(200);
  return res.json({ reports });
}

export async function listReports(_req: Request, res: Response) {
  const reports = await CitizenReportModel.find().sort({ createdAt: -1 }).limit(300);
  return res.json({ reports });
}

export async function updateReportStatus(req: Request, res: Response) {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const report = await CitizenReportModel.findByIdAndUpdate(
    req.params.reportId,
    { status: parsed.data.status },
    { new: true }
  );

  if (!report) return res.status(404).json({ error: "Report not found" });
  return res.json({ report });
}
