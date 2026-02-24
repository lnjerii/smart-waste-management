import { Schema, model, Types } from "mongoose";

const stopSchema = new Schema(
  {
    binId: { type: String, required: true },
    order: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "collected", "skipped", "damaged"],
      default: "pending"
    },
    note: { type: String },
    completedAt: { type: Date }
  },
  { _id: false }
);

const routePlanSchema = new Schema(
  {
    collectorId: { type: Types.ObjectId, ref: "User" },
    generatedBy: { type: Types.ObjectId, ref: "User", required: true },
    algorithm: { type: String, required: true },
    status: {
      type: String,
      enum: ["assigned", "in_progress", "completed"],
      default: "assigned"
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    stops: { type: [stopSchema], default: [] }
  },
  { timestamps: true }
);

export const RoutePlanModel = model("RoutePlan", routePlanSchema);
