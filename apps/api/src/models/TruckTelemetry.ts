import { Schema, model } from "mongoose";

const truckTelemetrySchema = new Schema(
  {
    truckId: { type: String, required: true, index: true },
    engineTempC: { type: Number, required: true },
    vibrationScore: { type: Number, required: true },
    fuelEfficiencyKmPerL: { type: Number, required: true },
    odometerKm: { type: Number, required: true }
  },
  { timestamps: true }
);

export const TruckTelemetryModel = model("TruckTelemetry", truckTelemetrySchema);
