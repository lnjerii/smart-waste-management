import { Schema, model, Types } from "mongoose";

const citizenReportSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["overflow", "damaged_bin", "illegal_dumping", "new_bin_request"],
      required: true
    },
    description: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    photoUrl: { type: String },
    reporterId: { type: Types.ObjectId, ref: "User" },
    reporterName: { type: String },
    reporterEmail: { type: String },
    status: {
      type: String,
      enum: ["open", "in_review", "resolved", "rejected"],
      default: "open"
    }
  },
  { timestamps: true }
);

export const CitizenReportModel = model("CitizenReport", citizenReportSchema);
