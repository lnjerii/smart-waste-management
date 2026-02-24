import { Schema, model, Types } from "mongoose";

const citizenRewardSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User" },
    email: { type: String, required: true },
    points: { type: Number, required: true },
    source: { type: String, enum: ["reporting", "recycling", "cleanup_event"], required: true },
    redeemedVia: { type: String, enum: ["mpesa", "airtime", "discount"], default: "airtime" }
  },
  { timestamps: true }
);

export const CitizenRewardModel = model("CitizenReward", citizenRewardSchema);
