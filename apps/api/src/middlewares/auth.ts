import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserRole } from "../types/roles.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.header("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string; role: UserRole };
    req.user = { userId: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function attachAuthIfPresent(req: Request, _res: Response, next: NextFunction) {
  const auth = req.header("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string; role: UserRole };
    req.user = { userId: payload.sub, role: payload.role };
  } catch {
    // Ignore invalid optional token for public endpoints.
  }

  return next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return next();
  };
}
