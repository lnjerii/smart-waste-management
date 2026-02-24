import { UserRole } from "../types/roles.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}

export {};
