import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/auth";
import { NotFoundError, BadRequestError } from "../../lib/errors";

const router = Router();

const SUPPORTED_CHAINS = ["Ethereum", "BSC", "Arbitrum", "Optimism", "Avalanche", "Solana"];

/**
 * POST /api/bridge/request
 * Request credential bridge to another chain (simulated Chainlink CCIP)
 */
router.post(
  "/request",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { credentialId, targetChain } = req.body;

    if (!credentialId || !targetChain) {
      throw new BadRequestError("credentialId and targetChain are required");
    }

    if (!SUPPORTED_CHAINS.includes(targetChain)) {
      throw new BadRequestError(
        `Unsupported target chain. Supported: ${SUPPORTED_CHAINS.join(", ")}`
      );
    }

    const credential = await prisma.credential.findUnique({
      where: { id: credentialId },
      select: { id: true, credentialHash: true, txHash: true, studentId: true, status: true },
    });

    if (!credential) throw new NotFoundError("Credential not found");
    if (credential.studentId !== req.user!.id && req.user!.role !== "ADMIN") {
      throw new BadRequestError("Can only bridge your own credentials");
    }
    if (credential.status !== "VALID") {
      throw new BadRequestError("Can only bridge valid credentials");
    }

    // Check for existing bridge to same chain
    const existing = await prisma.bridgeRequest.findFirst({
      where: { credentialId, targetChain, status: { not: "FAILED" } },
    });

    if (existing) {
      return res.json({ message: "Bridge already exists or is pending", bridgeRequest: existing });
    }

    // Create bridge request (simulated — in production this would trigger Chainlink CCIP)
    const bridge = await prisma.bridgeRequest.create({
      data: {
        credentialId,
        sourceChain: "Polygon",
        targetChain,
        status: "PENDING",
        sourceTxHash: credential.txHash,
      },
    });

    // Simulate bridge completion after creation (in demo, immediately resolve)
    const crypto = await import("crypto");
    const fakeTxHash = "0x" + crypto.randomBytes(32).toString("hex");

    await prisma.bridgeRequest.update({
      where: { id: bridge.id },
      data: {
        status: "BRIDGED",
        targetTxHash: fakeTxHash,
        bridgedAt: new Date(),
      },
    });

    const updated = await prisma.bridgeRequest.findUnique({ where: { id: bridge.id } });

    await prisma.auditEvent.create({
      data: {
        actorId: req.user!.id,
        action: "CREDENTIAL_BRIDGED",
        entityType: "BridgeRequest",
        entityId: bridge.id,
        metadata: { credentialId, targetChain, targetTxHash: fakeTxHash },
      },
    });

    res.status(201).json({
      bridgeRequest: updated,
      message: `Credential successfully bridged from Polygon to ${targetChain} via Chainlink CCIP`,
      verifyOn: {
        chain: targetChain,
        txHash: fakeTxHash,
        explorer: getExplorerUrl(targetChain, fakeTxHash),
      },
    });
  })
);

/**
 * GET /api/bridge/status/:id
 * Check bridge request status
 */
router.get(
  "/status/:id",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const bridge = await prisma.bridgeRequest.findUnique({
      where: { id: req.params.id },
      include: {
        credential: {
          select: { title: true, credentialHash: true },
        },
      },
    });

    if (!bridge) throw new NotFoundError("Bridge request not found");

    res.json(bridge);
  })
);

/**
 * GET /api/bridge/credential/:credentialId
 * Get all bridge requests for a credential
 */
router.get(
  "/credential/:credentialId",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const bridges = await prisma.bridgeRequest.findMany({
      where: { credentialId: req.params.credentialId },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      credentialId: req.params.credentialId,
      bridges,
      supportedChains: SUPPORTED_CHAINS,
    });
  })
);

function getExplorerUrl(chain: string, txHash: string): string {
  const explorers: Record<string, string> = {
    Ethereum: `https://etherscan.io/tx/${txHash}`,
    BSC: `https://bscscan.com/tx/${txHash}`,
    Arbitrum: `https://arbiscan.io/tx/${txHash}`,
    Optimism: `https://optimistic.etherscan.io/tx/${txHash}`,
    Avalanche: `https://snowtrace.io/tx/${txHash}`,
    Solana: `https://solscan.io/tx/${txHash}`,
  };
  return explorers[chain] || "#";
}

export default router;
