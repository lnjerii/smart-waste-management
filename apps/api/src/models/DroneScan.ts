import { Schema, model } from "mongoose";

const droneScanSchema = new Schema(
  {
    landfillSite: { type: String, required: true },
    riskLevel: { type: String, enum: ["low", "medium", "high"], required: true },
    notes: { type: String },
    imageUrl: { type: String }
  },
  { timestamps: true }
);

export const DroneScanModel = model("DroneScan", droneScanSchema);
