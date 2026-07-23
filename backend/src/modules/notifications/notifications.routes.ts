import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/auth";

const router = Router();

/**
 * GET /api/notifications/receipts
 * Student sees who verified their credentials, when, and from where
 */
router.get(
  "/receipts",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [receipts, total] = await Promise.all([
      prisma.verificationReceipt.findMany({
        where: { credentialOwnerId: req.user!.id },
        include: {
          credential: {
            select: { title: true, credentialType: true, credentialHash: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.verificationReceipt.count({
        where: { credentialOwnerId: req.user!.id },
      }),
    ]);

    res.json({
      receipts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  })
);

/**
 * GET /api/notifications/unread-count
 * Badge count for UI
 */
router.get(
  "/unread-count",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const count = await prisma.verificationReceipt.count({
      where: {
        credentialOwnerId: req.user!.id,
        isRead: false,
      },
    });

    res.json({ unreadCount: count });
  })
);

/**
 * POST /api/notifications/mark-read
 * Mark receipts as read
 */
router.post(
  "/mark-read",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { receiptIds } = req.body;

    if (receiptIds && Array.isArray(receiptIds)) {
      await prisma.verificationReceipt.updateMany({
        where: {
          id: { in: receiptIds },
          credentialOwnerId: req.user!.id,
        },
        data: { isRead: true },
      });
    } else {
      // Mark all as read
      await prisma.verificationReceipt.updateMany({
        where: { credentialOwnerId: req.user!.id, isRead: false },
        data: { isRead: true },
      });
    }

    res.json({ success: true });
  })
);

/**
 * Helper: Create a verification receipt when someone verifies a credential.
 * Called from the verify routes.
 */
export async function createVerificationReceipt(
  credentialId: string,
  credentialOwnerId: string,
  verifierIp: string | null,
  verifierName: string | null,
  verifierRole: string | null,
  queryType: string
) {
  try {
    await prisma.verificationReceipt.create({
      data: {
        credentialId,
        credentialOwnerId,
        verifierIp,
        verifierName,
        verifierRole,
        queryType,
      },
    });
  } catch (err) {
    // Non-fatal: don't fail the verification if receipt creation fails
    console.warn("Failed to create verification receipt:", err);
  }
}

export default router;
