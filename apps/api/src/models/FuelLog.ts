import { Schema, model } from "mongoose";

const fuelLogSchema = new Schema(
  {
    truckId: { type: String, required: true },
    liters: { type: Number, required: true },
    distanceKm: { type: Number, required: true },
    routeOptimized: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const FuelLogModel = model("FuelLog", fuelLogSchema);
