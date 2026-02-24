import { Schema, model } from "mongoose";

const binSchema = new Schema(
  {
    binId: { type: String, required: true, unique: true },
    fillLevel: { type: Number, required: true },
    temperatureC: { type: Number, required: true },
    batteryLevel: { type: Number },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    lastSeenAt: { type: Date, required: true }
  },
  { timestamps: true }
);

export const BinModel = model("Bin", binSchema);
