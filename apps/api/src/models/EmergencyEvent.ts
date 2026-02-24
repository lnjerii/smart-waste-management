import { Schema, model } from "mongoose";

const emergencyEventSchema = new Schema(
  {
    type: { type: String, enum: ["flood", "blocked_drainage", "floating_bin", "fire"], required: true },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    weather: { type: String },
    status: { type: String, enum: ["open", "resolved"], default: "open" }
  },
  { timestamps: true }
);

export const EmergencyEventModel = model("EmergencyEvent", emergencyEventSchema);
