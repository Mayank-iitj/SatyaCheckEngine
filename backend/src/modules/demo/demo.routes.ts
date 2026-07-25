import { Router } from "express";
import { prisma } from "../../lib/prisma";
import crypto from "crypto";
import { authenticate } from "../../middleware/auth";

const router = Router();

// Generate random mock hash
const generateMockHash = () => "0x" + crypto.randomBytes(32).toString("hex");
const generateMockIPFS = () => "Qm" + crypto.randomBytes(22).toString("hex");
const generateMockTx = () => "0x" + crypto.randomBytes(32).toString("hex");
const generateMockSig = () => "0x" + crypto.randomBytes(65).toString("hex");

// SEED STUDENT: Generate 10 diverse credentials for the logged-in student
router.post("/student", authenticate, async (req: any, res: any) => {
  try {
    const studentEmail = req.user.email;
    if (!studentEmail) {
      return res.status(400).json({ error: "Student email not found in token." });
    }

    // Ensure we have a mock institution for the credentials
    let inst = await prisma.institution.findFirst({ where: { verified: true } });
    if (!inst) {
      const dummyUser = await prisma.user.upsert({
        where: { email: "admin@git.edu" },
        update: {},
        create: {
          email: "admin@git.edu",
          name: "Admin User",
          role: "UNIVERSITY",
        }
      });
      inst = await prisma.institution.create({
        data: {
          userId: dummyUser.id,
          name: "Global Institute of Technology",
          country: "US",
          verified: true,
        }
      });
    }

    const demoCredentials = [
      {
        studentId: req.user.id,
        recipientName: req.user.name || "Demo Student",
        credentialType: "DEGREE",
        title: "B.S. in Computer Science",
        description: "Graduated with honors. Specialization in Blockchain and Applied Cryptography.",
        issueDate: new Date("2024-05-15"),
        institutionId: inst.id,
        credentialHash: generateMockHash(),
        status: "VALID",
        source: "BLOCKCHAIN",
        ipfsCID: generateMockIPFS(),
        txHash: generateMockTx(),
        signature: generateMockSig(),
        sealedCopyCID: generateMockIPFS(),
        sealedCopyHash: generateMockHash(),
      },
      {
        studentId: req.user.id,
        recipientName: req.user.name || "Demo Student",
        credentialType: "CERTIFICATE",
        title: "Advanced Machine Learning Certificate",
        description: "Completed 120-hour intensive coursework in neural networks and NLP.",
        issueDate: new Date("2025-01-10"),
        institutionId: inst.id,
        credentialHash: generateMockHash(),
        status: "VALID",
        source: "DIGILOCKER_VERIFIED", // Adds the Digilocker badge
        ipfsCID: generateMockIPFS(),
        txHash: generateMockTx(),
        signature: generateMockSig(),
        sealedCopyCID: generateMockIPFS(),
        sealedCopyHash: generateMockHash(),
      },
      {
        studentId: req.user.id,
        recipientName: req.user.name || "Demo Student",
        credentialType: "MICRO_CREDENTIAL",
        title: "Ethereum Smart Contract Auditing",
        description: "Passed rigorous security auditing assessment. Score: 98%.",
        issueDate: new Date("2025-06-20"),
        institutionId: inst.id,
        credentialHash: generateMockHash(),
        status: "VALID",
        source: "BLOCKCHAIN",
        ipfsCID: generateMockIPFS(),
        txHash: generateMockTx(),
        signature: generateMockSig(),
        sealedCopyCID: generateMockIPFS(),
        sealedCopyHash: generateMockHash(),
      },
      {
        studentId: req.user.id,
        recipientName: req.user.name || "Demo Student",
        credentialType: "DIPLOMA",
        title: "Diploma in Data Structures",
        description: "Foundational algorithms and data structures.",
        issueDate: new Date("2023-12-05"),
        institutionId: inst.id,
        credentialHash: generateMockHash(),
        status: "VALID",
        source: "BLOCKCHAIN",
        ipfsCID: generateMockIPFS(),
        txHash: generateMockTx(),
        signature: generateMockSig(),
        sealedCopyCID: generateMockIPFS(),
        sealedCopyHash: generateMockHash(),
      },
      {
        studentId: req.user.id,
        recipientName: req.user.name || "Demo Student",
        credentialType: "CERTIFICATE",
        title: "Cloud Architecture (AWS)",
        description: "Certified AWS Solutions Architect.",
        issueDate: new Date("2026-03-12"),
        institutionId: inst.id,
        credentialHash: generateMockHash(),
        status: "VALID",
        source: "BLOCKCHAIN",
        ipfsCID: generateMockIPFS(),
        txHash: generateMockTx(),
        signature: generateMockSig(),
        sealedCopyCID: generateMockIPFS(),
        sealedCopyHash: generateMockHash(),
      },
      {
        studentId: req.user.id,
        recipientName: req.user.name || "Demo Student",
        credentialType: "MICRO_CREDENTIAL",
        title: "React & Next.js Masterclass",
        description: "Front-end engineering specialization.",
        issueDate: new Date("2024-08-22"),
        institutionId: inst.id,
        credentialHash: generateMockHash(),
        status: "VALID",
        source: "BLOCKCHAIN",
        ipfsCID: generateMockIPFS(),
        txHash: generateMockTx(),
        signature: generateMockSig(),
        sealedCopyCID: generateMockIPFS(),
        sealedCopyHash: generateMockHash(),
      },
      {
        studentId: req.user.id,
        recipientName: req.user.name || "Demo Student",
        credentialType: "DEGREE",
        title: "M.S. in Artificial Intelligence",
        description: "Pending Thesis Approval.",
        issueDate: new Date("2027-05-15"),
        institutionId: inst.id,
        credentialHash: generateMockHash(),
        status: "PENDING",
        source: "BLOCKCHAIN",
        ipfsCID: generateMockIPFS(),
        txHash: generateMockTx(),
        signature: generateMockSig(),
        sealedCopyCID: generateMockIPFS(),
        sealedCopyHash: generateMockHash(),
      },
      {
        studentId: req.user.id,
        recipientName: req.user.name || "Demo Student",
        credentialType: "CERTIFICATE",
        title: "Cybersecurity Fundamentals",
        description: "Network security and ethical hacking.",
        issueDate: new Date("2022-11-10"),
        institutionId: inst.id,
        credentialHash: generateMockHash(),
        status: "VALID",
        source: "BLOCKCHAIN",
        ipfsCID: generateMockIPFS(),
        txHash: generateMockTx(),
        signature: generateMockSig(),
        sealedCopyCID: generateMockIPFS(),
        sealedCopyHash: generateMockHash(),
      },
      {
        studentId: req.user.id,
        recipientName: req.user.name || "Demo Student",
        credentialType: "MICRO_CREDENTIAL",
        title: "Agile Project Management",
        description: "Scrum Master Certification.",
        issueDate: new Date("2023-04-18"),
        institutionId: inst.id,
        credentialHash: generateMockHash(),
        status: "VALID",
        source: "BLOCKCHAIN",
        ipfsCID: generateMockIPFS(),
        txHash: generateMockTx(),
        signature: generateMockSig(),
        sealedCopyCID: generateMockIPFS(),
        sealedCopyHash: generateMockHash(),
      },
      {
        studentId: req.user.id,
        recipientName: req.user.name || "Demo Student",
        credentialType: "CERTIFICATE",
        title: "Outdated Web Frameworks",
        description: "Revoked due to curriculum deprecation.",
        issueDate: new Date("2021-02-14"),
        institutionId: inst.id,
        credentialHash: generateMockHash(),
        status: "REVOKED", // Shows revoked status
        source: "BLOCKCHAIN",
        ipfsCID: generateMockIPFS(),
        txHash: generateMockTx(),
        signature: generateMockSig(),
        sealedCopyCID: generateMockIPFS(),
        sealedCopyHash: generateMockHash(),
      },
    ];

    await prisma.credential.createMany({
      data: demoCredentials
    });
    
    // Seed Skill Profile
    const creds = await prisma.credential.findMany({ where: { studentId: req.user.id }});
    if (creds.length > 0) {
      const profile = await prisma.skillProfile.upsert({
        where: { userId: req.user.id },
        update: {},
        create: {
          userId: req.user.id,
          title: "Full Stack Blockchain Engineer",
          bio: "Passionate about decentralized systems and secure architectures.",
          totalScore: 92.5
        }
      });
      
      const skills = ["Blockchain", "Machine Learning", "Cryptography", "React", "Next.js", "Python"];
      for (let i = 0; i < Math.min(skills.length, creds.length); i++) {
        await prisma.skillProfileEntry.upsert({
          where: { profileId_credentialId: { profileId: profile.id, credentialId: creds[i].id } },
          update: {},
          create: {
            profileId: profile.id,
            credentialId: creds[i].id,
            skillTag: skills[i],
            weight: 1.5 + (i * 0.1)
          }
        });
      }
      
      // Also generate a bridge request, equivalency mapping, recovery request, and digilocker consent
      await prisma.bridgeRequest.create({
        data: {
          credentialId: creds[0].id,
          targetChain: "Ethereum",
          status: "PENDING"
        }
      });
      
      await prisma.equivalencyMapping.create({
        data: {
          credentialId: creds[0].id,
          sourceCountry: "India",
          sourceFramework: "UGC Degree",
          targetCountry: "USA",
          targetFramework: "US Bachelor's Degree",
          confidenceScore: 94.5,
          details: JSON.stringify({ summary: "Verified equivalent to a 4-year degree in the US." })
        }
      });
      
      await prisma.recoveryRequest.create({
        data: {
          studentId: req.user.id,
          institutionId: creds[0].institutionId,
          originalTitle: "Lost Diploma",
          originalType: "DIPLOMA",
          originalDate: "2019-01-01",
          status: "PENDING"
        }
      });
      
      await prisma.digiLockerConsent.create({
        data: {
          studentId: req.user.id,
          consentToken: generateMockHash(),
          docType: "DEGREE",
          expiresAt: new Date(Date.now() + 86400000),
          status: "PENDING",
          digiLockerId: "DL-12345"
        }
      });
    }

    res.json({ message: "10 Demo Credentials, Skill Profile, and advanced tracking records seeded successfully" });
  } catch (error: any) {
    console.error("Demo Seed Error:", error);
    res.status(500).json({ error: "Failed to seed demo data" });
  }
});

// SEED RECRUITER: Generate 5 realistic jobs
router.post("/recruiter", authenticate, async (req: any, res: any) => {
  try {
    const recruiterId = req.user.id;
    
    const demoJobs = [
      {
        title: "Senior Blockchain Engineer",
        company: "Web3 Innovations Inc.",
        location: "Remote",
        description: "Looking for an expert smart contract developer to lead our DeFi protocol. Must have rigorous cryptographic background.",
        requiredCredTypes: "DEGREE,CERTIFICATE",
        requiredKeywords: "solidity, cryptography, smart contracts",
        minReputationScore: 85,
        salaryRange: "$160k - $200k",
        recruiterId: recruiterId
      },
      {
        title: "Machine Learning Researcher",
        company: "DeepData AI",
        location: "San Francisco, CA",
        description: "Researching novel neural network architectures. Requires strong academic background and relevant publications.",
        requiredCredTypes: "DEGREE",
        requiredKeywords: "machine learning, python, pytorch",
        minReputationScore: 90,
        salaryRange: "$180k - $250k",
        recruiterId: recruiterId
      },
      {
        title: "Cloud Security Architect",
        company: "SecureNet Global",
        location: "London, UK (Hybrid)",
        description: "Design and implement zero-trust architectures across our AWS infrastructure. Requires advanced security certifications.",
        requiredCredTypes: "CERTIFICATE,DEGREE",
        requiredKeywords: "aws, security, zero trust",
        minReputationScore: 80,
        salaryRange: "£110k - £140k",
        recruiterId: recruiterId
      },
      {
        title: "Full Stack Web Developer",
        company: "StartupX",
        location: "New York, NY",
        description: "Fast-paced environment building consumer-facing apps. Looking for Next.js and React experts.",
        requiredCredTypes: "MICRO_CREDENTIAL,CERTIFICATE",
        requiredKeywords: "react, next.js, typescript",
        minReputationScore: 70,
        salaryRange: "$120k - $150k",
        recruiterId: recruiterId
      },
      {
        title: "Data Analyst",
        company: "FinTech Solutions",
        location: "Remote",
        description: "Analyzing large datasets to drive financial product decisions. SQL and Python required.",
        requiredCredTypes: "DEGREE,DIPLOMA",
        requiredKeywords: "sql, python, data analysis",
        minReputationScore: 75,
        salaryRange: "$90k - $120k",
        recruiterId: recruiterId
      }
    ];

    await prisma.jobPosting.createMany({
      data: demoJobs
    });
    
    // Create fake matches for these jobs
    const jobs = await prisma.jobPosting.findMany({ where: { recruiterId }});
    const someStudent = await prisma.user.findFirst({ where: { role: "STUDENT" } });
    
    if (someStudent && jobs.length > 0) {
      const matchData = jobs.map((job: any) => ({
        jobId: job.id,
        studentId: someStudent.id,
        matchScore: Math.floor(Math.random() * 20) + 80, // 80-100 score
        matchReasons: JSON.stringify(["Semantic overlap with Blockchain", "Verified Degree found", "High skill density"]),
        status: "NEW"
      }));
      await prisma.jobMatch.createMany({ data: matchData });
    }

    res.json({ message: "5 Demo Jobs & Matches seeded successfully" });
  } catch (error: any) {
    console.error("Demo Seed Error:", error);
    res.status(500).json({ error: "Failed to seed demo data" });
  }
});

// SEED ADMIN: Generate 5 institutions
router.post("/admin", async (req: any, res: any) => {
  try {
    const demoInsts = [
      { name: "Massachusetts Institute of Technology", email: "admin@mit.edu", verified: true, stakeBond: 100000, country: "US" },
      { name: "Stanford University", email: "admin@stanford.edu", verified: true, stakeBond: 100000, country: "US" },
      { name: "University of Waterloo", email: "admin@waterloo.ca", verified: true, stakeBond: 50000, country: "CA" },
      { name: "Fake Degree Mill Academy", email: "scam@fake.edu", verified: false, stakeBond: 0, country: "US" },
      { name: "New Tech Institute", email: "pending@tech.edu", verified: false, stakeBond: 10000, country: "US" }
    ];

    for (const inst of demoInsts) {
      const user = await prisma.user.upsert({
        where: { email: inst.email },
        update: {},
        create: { email: inst.email, name: inst.name, role: "UNIVERSITY" }
      });
      const exists = await prisma.institution.findUnique({ where: { userId: user.id } });
      if (!exists) {
        await prisma.institution.create({ data: {
          userId: user.id,
          name: inst.name,
          country: inst.country,
          verified: inst.verified,
          stakeBond: inst.stakeBond
        }});
      }
    }
    
    // Seed Plagiarism (ThesisFingerprints)
    const thesisData = [
      { fingerprint: generateMockHash(), title: "Optimizing ZK-Rollups", authorName: "Alice Smith", wordCount: 15400 },
      { fingerprint: generateMockHash(), title: "Semantic Analysis of Smart Contracts", authorName: "Bob Jones", wordCount: 12050 },
      { fingerprint: generateMockHash(), title: "Decentralized Identity Frameworks", authorName: "Charlie Brown", wordCount: 18200 }
    ];
    await prisma.thesisFingerprint.createMany({ data: thesisData });
    
    // Update Platform Stats
    await prisma.platformStats.upsert({
      where: { id: "global" },
      update: {
        credentialsVerified: 125430,
        institutionsOnboarded: 45,
        fraudBlocked: 1250,
        jobsMatched: 8400
      },
      create: {
        id: "global",
        credentialsVerified: 125430,
        institutionsOnboarded: 45,
        fraudBlocked: 1250,
        jobsMatched: 8400
      }
    });

    res.json({ message: "Demo Institutions, Plagiarism, and Stats seeded successfully" });
  } catch (error: any) {
    console.error("Demo Seed Error:", error);
    res.status(500).json({ error: "Failed to seed demo data" });
  }
});

export default router;
