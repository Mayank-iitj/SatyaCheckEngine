import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getHeatmapData = async (req: Request, res: Response) => {
  try {
    const campaigns = await prisma.heatmapCampaign.findMany({
      include: {
        nodes: {
          include: {
            edgesSource: true
          }
        }
      }
    });
    res.json({ campaigns });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch heatmap data" });
  }
};

export const submitWhistleblowerReport = async (req: Request, res: Response) => {
  try {
    const { zkProofHash, companyName, reportData } = req.body;
    const report = await prisma.whistleblowerReport.create({
      data: { zkProofHash, companyName, reportData, status: "UNVERIFIED" },
    });
    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit report" });
  }
};

export const getWhistleblowerReports = async (req: Request, res: Response) => {
  try {
    const reports = await prisma.whistleblowerReport.findMany();
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

export const getCloneRadarData = async (req: Request, res: Response) => {
  try {
    const domains = await prisma.scamDomain.findMany();
    res.json({ domains });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clone radar data" });
  }
};

export const checkVernacularScam = async (req: Request, res: Response) => {
  try {
    // Mock logic: return a simulated translated scam attempt
    res.json({
      intent: "SCAM",
      detectedLanguage: "Marathi",
      translation: "I will double your money in 2 days if you invest in Suzlon today.",
      confidence: 0.99,
      action: "INTERRUPT_CALL",
      warningAudioId: "marathi_warning_01"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to process audio" });
  }
};

export const getXrayDeepfakes = async (req: Request, res: Response) => {
  try {
    const records = await prisma.deepfakeRecord.findMany();
    res.json({ records });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch deepfake records" });
  }
};
