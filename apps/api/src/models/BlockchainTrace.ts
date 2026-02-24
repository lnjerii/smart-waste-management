import { Schema, model } from "mongoose";

const blockchainTraceSchema = new Schema(
  {
    batchId: { type: String, required: true },
    hash: { type: String, required: true },
    actor: { type: String, required: true },
    action: { type: String, required: true }
  },
  { timestamps: true }
);

export const BlockchainTraceModel = model("BlockchainTrace", blockchainTraceSchema);
