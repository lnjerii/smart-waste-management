import { z } from "zod";

export const telemetrySchema = z.object({
  binId: z.string().min(1),
  fillLevel: z.number().min(0).max(100),
  temperatureC: z.number().min(-20).max(150),
  batteryLevel: z.number().min(0).max(100).optional(),
  timestamp: z.string().datetime().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  })
});

export type TelemetryInput = z.infer<typeof telemetrySchema>;
