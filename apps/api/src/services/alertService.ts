import { AlertModel } from "../models/Alert.js";
import { env } from "../config/env.js";

export async function evaluateAlerts(input: { binId: string; fillLevel: number; temperatureC: number }) {
  const alerts = [];

  if (input.fillLevel >= env.fillCritical) {
    alerts.push({
      type: "fill_critical",
      level: "critical",
      message: `Bin ${input.binId} reached critical fill level (${input.fillLevel}%).`
    });
  } else if (input.fillLevel >= env.fillWarning) {
    alerts.push({
      type: "fill_warning",
      level: "warning",
      message: `Bin ${input.binId} reached warning fill level (${input.fillLevel}%).`
    });
  }

  if (input.temperatureC >= env.tempCritical) {
    alerts.push({
      type: "fire_risk",
      level: "critical",
      message: `Bin ${input.binId} has high temperature (${input.temperatureC} C).`
    });
  }

  if (alerts.length === 0) return [];

  return AlertModel.insertMany(
    alerts.map((a) => ({
      ...a,
      binId: input.binId
    }))
  );
}
