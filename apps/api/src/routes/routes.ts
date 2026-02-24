import { Router } from "express";
import {
  generateRoute,
  getMyActiveRoute,
  listRoutes,
  updateStopStatus
} from "../controllers/routeController.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

export const routesRouter = Router();

routesRouter.post("/generate", requireAuth, requireRole("admin"), generateRoute);
routesRouter.get("/", requireAuth, requireRole("admin"), listRoutes);
routesRouter.get("/my", requireAuth, requireRole("collector", "admin"), getMyActiveRoute);
routesRouter.patch(
  "/:routeId/stops/:binId/status",
  requireAuth,
  requireRole("collector", "admin"),
  updateStopStatus
);
