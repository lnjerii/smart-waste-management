import { Schema, model } from "mongoose";

const alertSchema = new Schema(
  {
    binId: { type: String, required: true },
    type: { type: String, enum: ["fill_warning", "fill_critical", "fire_risk"], required: true },
    level: { type: String, enum: ["warning", "critical"], required: true },
    message: { type: String, required: true },
    isResolved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const AlertModel = model("Alert", alertSchema);
