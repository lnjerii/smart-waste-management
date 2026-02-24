import { Schema, model } from "mongoose";

const telemetryRecordSchema = new Schema(
  {
    binId: { type: String, required: true, index: true },
    fillLevel: { type: Number, required: true },
    temperatureC: { type: Number, required: true },
    batteryLevel: { type: Number },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    recordedAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

export const TelemetryRecordModel = model("TelemetryRecord", telemetryRecordSchema);
