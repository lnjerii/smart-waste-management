import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { UserModel } from "../models/User.js";
import { env } from "../config/env.js";
import { UserRole } from "../types/roles.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "collector", "citizen"]).default("citizen")
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const resetTestAccountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "collector", "citizen"]).optional(),
  resetCode: z.string()
});

const resetAllTestAccountsSchema = z.object({
  resetCode: z.string()
});

function signToken(input: { id: string; role: UserRole }) {
  return jwt.sign({ role: input.role }, env.jwtSecret, {
    subject: input.id,
    expiresIn: "8h"
  });
}

function defaultNameFromRole(role: UserRole) {
  if (role === "admin") return "SWMS Admin";
  if (role === "collector") return "SWMS Collector";
  return "SWMS Citizen";
}

async function upsertTestAccount(input: { email: string; password: string; role: UserRole }) {
  const normalizedEmail = input.email.toLowerCase();
  const passwordHash = await bcrypt.hash(input.password, 10);

  const existing = await UserModel.findOne({ email: normalizedEmail });
  if (existing) {
    existing.role = input.role;
    if (!existing.name || existing.name.trim().length === 0) {
      existing.name = defaultNameFromRole(input.role);
    }
    existing.passwordHash = passwordHash;
    await existing.save();
    return { created: false, user: existing };
  }

  const created = await UserModel.create({
    name: defaultNameFromRole(input.role),
    email: normalizedEmail,
    passwordHash,
    role: input.role
  });

  return { created: true, user: created };
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const { name, email, password, role } = parsed.data;

  const existing = await UserModel.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ name, email: email.toLowerCase(), passwordHash, role });
  const token = signToken({ id: user.id, role: user.role as UserRole });

  return res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const user = await UserModel.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken({ id: user.id, role: user.role as UserRole });

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

export async function resetTestAccount(req: Request, res: Response) {
  const parsed = resetTestAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  const { email, password, role, resetCode } = parsed.data;

  if (!env.adminInviteCode || resetCode !== env.adminInviteCode) {
    return res.status(403).json({ error: "Invalid reset code" });
  }

  const finalRole = (role ?? "citizen") as UserRole;
  const result = await upsertTestAccount({ email, password, role: finalRole });

  return res.status(result.created ? 201 : 200).json({
    message: result.created ? "Test account created via reset" : "Test account password reset",
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role
    }
  });
}

export async function resetAllTestAccounts(req: Request, res: Response) {
  const parsed = resetAllTestAccountsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }

  if (!env.adminInviteCode || parsed.data.resetCode !== env.adminInviteCode) {
    return res.status(403).json({ error: "Invalid reset code" });
  }

  const defaults = [
    { email: "admin@swms.local", password: "admin12345", role: "admin" as UserRole },
    { email: "collector@swms.local", password: "collector123", role: "collector" as UserRole },
    { email: "citizen@swms.local", password: "citizen123", role: "citizen" as UserRole }
  ];

  const results = [] as Array<{ email: string; role: string; action: "created" | "reset" }>;

  for (const account of defaults) {
    const result = await upsertTestAccount(account);
    results.push({
      email: account.email,
      role: account.role,
      action: result.created ? "created" : "reset"
    });
  }

  return res.json({ message: "All test accounts processed", results });
}

export async function me(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });

  const user = await UserModel.findById(req.user.userId).select("name email role");
  if (!user) return res.status(404).json({ error: "User not found" });

  return res.json({ user });
}
