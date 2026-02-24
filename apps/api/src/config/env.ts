import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: process.env.MONGODB_URI ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  iotDeviceToken: process.env.IOT_DEVICE_TOKEN ?? "",
  fillWarning: Number(process.env.ALERT_FILL_WARNING ?? 80),
  fillCritical: Number(process.env.ALERT_FILL_CRITICAL ?? 90),
  tempCritical: Number(process.env.ALERT_TEMPERATURE_CRITICAL ?? 60),
  optimizerUrl: process.env.OPTIMIZER_URL ?? "http://localhost:5001",
  adminInviteCode: process.env.ADMIN_INVITE_CODE ?? ""
};
