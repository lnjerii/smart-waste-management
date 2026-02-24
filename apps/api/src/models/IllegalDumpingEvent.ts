import { Schema, model } from "mongoose";

const illegalDumpingEventSchema = new Schema(
  {
    imageUrl: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    confidence: { type: Number, required: true },
    detectedByModel: { type: String, required: true },
    numberPlate: { type: String },
    status: { type: String, enum: ["open", "under_investigation", "closed"], default: "open" }
  },
  { timestamps: true }
);

export const IllegalDumpingEventModel = model("IllegalDumpingEvent", illegalDumpingEventSchema);
