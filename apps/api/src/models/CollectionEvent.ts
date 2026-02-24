import { Schema, model, Types } from "mongoose";

const collectionEventSchema = new Schema(
  {
    routePlanId: { type: Types.ObjectId, ref: "RoutePlan", required: true },
    binId: { type: String, required: true },
    collectorId: { type: Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: ["collected", "skipped", "damaged"],
      required: true
    },
    note: { type: String }
  },
  { timestamps: true }
);

export const CollectionEventModel = model("CollectionEvent", collectionEventSchema);
