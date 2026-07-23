import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { prisma } from "../lib/prisma";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

/**
 * Verify JWT token and attach user to request
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      email: string;
      role: string;
      name: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Optional authentication — attaches user if token present, doesn't fail otherwise
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      email: string;
      role: string;
      name: string;
    };
    req.user = decoded;
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}

/**
 * Role-based access control middleware factory
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        required: roles,
        current: req.user.role,
      });
    }
    next();
  };
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: {
  id: string;
  email: string;
  role: string;
  name: string;
}): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
}
