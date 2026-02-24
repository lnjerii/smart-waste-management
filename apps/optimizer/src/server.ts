import express from "express";
import cors from "cors";
import { z } from "zod";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ service: "swms-optimizer", status: "ok", health: "/health", optimize: "/optimize" }));

const optimizeSchema = z.object({
  depot: z.object({ lat: z.number(), lng: z.number() }),
  bins: z.array(
    z.object({
      binId: z.string(),
      location: z.object({ lat: z.number(), lng: z.number() }),
      priority: z.number().min(1).max(5)
    })
  )
});

function distance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy);
}

// Placeholder heuristic service. Swap with OR-Tools solver in production.
function optimizeRoute(input: z.infer<typeof optimizeSchema>) {
  const remaining = [...input.bins].sort((a, b) => b.priority - a.priority);
  const order: string[] = [];
  let current = input.depot;

  while (remaining.length) {
    let bestIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let i = 0; i < remaining.length; i += 1) {
      const item = remaining[i];
      const d = distance(current, item.location);
      const score = d - item.priority * 0.1;
      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    const next = remaining.splice(bestIndex, 1)[0];
    order.push(next.binId);
    current = next.location;
  }

  return { algorithm: "priority-nearest-neighbor", stops: order };
}

app.post("/optimize", (req, res) => {
  const parsed = optimizeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const plan = optimizeRoute(parsed.data);
  return res.json(plan);
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const port = Number(process.env.PORT ?? 5001);
app.listen(port, () => {
  console.log(`Optimizer listening on http://localhost:${port}`);
});
