import { Request, Response, NextFunction } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        clerkId?: string;
        role: string;
        name: string;
      };
    }
  }
}

/**
 * Verify Clerk token and sync local user
 */
export const authenticate = [
  requireAuth(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const clerkId = auth.userId;
      
      if (!clerkId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // We need user details. In a full production setup, this would come from a webhook or 
      // Clerk API fetch. Since we are in middleware, we expect the user to either exist,
      // or we can fallback to the claims if available.
      // The Clerk token (auth.sessionClaims) might have primary_email, but it's not guaranteed
      // unless configured. Let's try to find them by clerkId.
      let user = await prisma.user.findUnique({
        where: { clerkId }
      });

      if (!user) {
        // Fetch user from Clerk
        const { clerkClient } = await import("@clerk/express");
        const clerkUser = await clerkClient.users.getUser(clerkId);
        
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) {
          return res.status(400).json({ error: "Clerk user has no email address." });
        }

        // Try to find by email first (in case seeded user exists)
        user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          // Link seeded user
          user = await prisma.user.update({
            where: { email },
            data: { clerkId }
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              clerkId,
              email,
              name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : email.split('@')[0],
              role: "STUDENT" // Default role
            }
          });
        }
      }

      req.user = {
        id: user.id,
        email: user.email,
        clerkId: user.clerkId || undefined,
        role: user.role,
        name: user.name,
      };

      next();
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ error: "Authentication failed" });
    }
  }
];

/**
 * Optional authentication
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  // Try to get auth. If it fails, continue anyway.
  try {
    const auth = getAuth(req);
    if (auth.userId) {
      // In a real app we'd fetch the user here too, but for optional let's just proceed
      // Next step could be to populate req.user if needed.
    }
  } catch {}
  next();
};

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
