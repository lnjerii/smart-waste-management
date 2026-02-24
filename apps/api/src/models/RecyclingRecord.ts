import { Schema, model } from "mongoose";

const recyclingRecordSchema = new Schema(
  {
    category: { type: String, enum: ["plastic", "organic", "metal", "paper", "glass"], required: true },
    weightKg: { type: Number, required: true },
    binId: { type: String },
    area: { type: String, required: true },
    source: { type: String, enum: ["ai_camera", "manual", "collector"], default: "manual" }
  },
  { timestamps: true }
);

export const RecyclingRecordModel = model("RecyclingRecord", recyclingRecordSchema);
