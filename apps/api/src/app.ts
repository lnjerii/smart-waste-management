import express from "express";
import cors from "cors";
import helmet from "helmet";
import { telemetryRouter } from "./routes/telemetry.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { authRouter } from "./routes/auth.js";
import { routesRouter } from "./routes/routes.js";
import { reportsRouter } from "./routes/reports.js";
import { usersRouter } from "./routes/users.js";
import { advancedRouter } from "./routes/advanced.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({ service: "swms-api", status: "ok", health: "/health" });
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/telemetry", telemetryRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/routes", routesRouter);
  app.use("/api/v1/reports", reportsRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/advanced", advancedRouter);

  return app;
}
