import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import { prisma } from "../../lib/prisma";
import { generateToken } from "../../middleware/auth";
import { config } from "../../config";
import { validateRequest } from "../../middleware/validate";
import { loginSchema } from "./auth.schemas";
import { UnauthorizedError, BadRequestError } from "../../lib/errors";

const router = Router();

/**
 * POST /api/auth/register
 */
router.post("/register", asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role, institutionName, country } = req.body;

  if (!email || !password || !name || !role) {
    throw new BadRequestError("Missing required fields");
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new BadRequestError("Email already registered");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: role || "STUDENT",
    },
  });

  // If university, create institution record
  if (role === "UNIVERSITY" && institutionName) {
    await prisma.institution.create({
      data: {
        userId: user.id,
        name: institutionName,
        country: country || "Unknown",
        verified: false,
      },
    });
  }

  // Create audit event
  await prisma.auditEvent.create({
    data: {
      actorId: user.id,
      action: "USER_REGISTERED",
      entityType: "User",
      entityId: user.id,
      metadata: { role },
    },
  });

  const token = generateToken(user);

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  });
}));

/**
 * POST /api/auth/login
 */
router.post("/login", validateRequest(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: { institution: true },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Verify password
  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = generateToken(user);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      institution: user.institution
        ? {
            id: user.institution.id,
            name: user.institution.name,
            verified: user.institution.verified,
          }
        : undefined,
    },
    token,
  });
}));

/**
 * GET /api/auth/me
 */
router.get("/me", asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication required");
  }

  const jwt = await import("jsonwebtoken");
  let decoded: any;
  try {
    decoded = jwt.default.verify(authHeader.split(" ")[1], config.jwtSecret);
  } catch (err) {
    throw new UnauthorizedError("Invalid token");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: { institution: true },
  });

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    institution: user.institution
      ? {
          id: user.institution.id,
          name: user.institution.name,
          verified: user.institution.verified,
        }
      : undefined,
  });
}));

export default router;
