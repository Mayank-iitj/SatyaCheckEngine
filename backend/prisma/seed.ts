import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashData(data: string): string {
  return "0x" + crypto.createHash("sha256").update(data).digest("hex");
}

async function main() {
  console.log("🌱 Seeding SatyaCheck database (Absolute Win Edition)...\n");

  // ── 1. Global Platform Stats (Leaderboard Demo) ───────────────────────
  await prisma.platformStats.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      credentialsVerified: 14205,
      institutionsOnboarded: 42,
      fraudBlocked: 1337,
      countriesCovered: 12,
      credentialsIssued: 35000,
      recoveryCompleted: 156,
      jobsMatched: 840,
    },
  });
  console.log("✅ Seeded Global Platform Stats (Live Leaderboard base)");

  // ── 2. Create Admin User ──────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@satyacheck.io" },
    update: {},
    create: {
      email: "admin@satyacheck.io",
      passwordHash: adminPassword,
      name: "SatyaCheck Admin",
      role: "ADMIN",
    },
  });

  // ── 3. Create University Users & Institutions ─────────────────────────
  const uniPassword = await bcrypt.hash("university123", 10);

  const mitUser = await prisma.user.upsert({
    where: { email: "registrar@mit-demo.edu" },
    update: {},
    create: {
      email: "registrar@mit-demo.edu",
      passwordHash: uniPassword,
      name: "MIT Demo University Registrar",
      role: "UNIVERSITY",
    },
  });

  const mit = await prisma.institution.upsert({
    where: { userId: mitUser.id },
    update: {},
    create: {
      userId: mitUser.id,
      name: "MIT Demo University",
      country: "United States",
      verified: true,
      reputationScore: 98.5,
      description: "A world-leading research university committed to advancing knowledge.",
      stakeBond: 50000,
      tier: "ENTERPRISE",
    },
  });

  const stanfordUser = await prisma.user.upsert({
    where: { email: "registrar@stanford-demo.edu" },
    update: {},
    create: {
      email: "registrar@stanford-demo.edu",
      passwordHash: uniPassword,
      name: "Stanford Demo University Registrar",
      role: "UNIVERSITY",
    },
  });

  const stanford = await prisma.institution.upsert({
    where: { userId: stanfordUser.id },
    update: {},
    create: {
      userId: stanfordUser.id,
      name: "Stanford Demo University",
      country: "United States",
      verified: true,
      reputationScore: 97.2,
      description: "Pursuing the frontiers of knowledge and innovation.",
      stakeBond: 45000,
      tier: "ENTERPRISE",
    },
  });

  // Add an Indian University for equivalency demo
  const iitUser = await prisma.user.upsert({
    where: { email: "registrar@iit-demo.in" },
    update: {},
    create: {
      email: "registrar@iit-demo.in",
      passwordHash: uniPassword,
      name: "IIT Demo Registrar",
      role: "UNIVERSITY",
    },
  });

  const iit = await prisma.institution.upsert({
    where: { userId: iitUser.id },
    update: {},
    create: {
      userId: iitUser.id,
      name: "Indian Institute of Technology (Demo)",
      country: "India",
      verified: true,
      reputationScore: 95.0,
      description: "Premier engineering institute in India.",
      stakeBond: 10000,
      tier: "PRO",
    },
  });

  // Add a Free-tier University for disaster recovery demo
  const kyivUser = await prisma.user.upsert({
    where: { email: "registrar@kyiv-demo.ua" },
    update: {},
    create: {
      email: "registrar@kyiv-demo.ua",
      passwordHash: uniPassword,
      name: "Kyiv National Demo University",
      role: "UNIVERSITY",
    },
  });

  const kyiv = await prisma.institution.upsert({
    where: { userId: kyivUser.id },
    update: {},
    create: {
      userId: kyivUser.id,
      name: "Kyiv National University (Demo)",
      country: "Ukraine",
      verified: true,
      reputationScore: 85.0,
      description: "Continuing education despite adversity.",
      stakeBond: 0, // Free tier
      tier: "FREE",
    },
  });

  console.log("✅ Universities created (MIT, Stanford, IIT, Kyiv)");

  // ── 4. Create Student Users ───────────────────────────────────────────
  const studentPassword = await bcrypt.hash("student123", 10);

  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: "alice@student.demo" },
      update: {},
      create: {
        email: "alice@student.demo",
        passwordHash: studentPassword,
        name: "Alice Johnson",
        role: "STUDENT",
      },
    }),
    prisma.user.upsert({
      where: { email: "bob@student.demo" },
      update: {},
      create: {
        email: "bob@student.demo",
        passwordHash: studentPassword,
        name: "Bob Williams",
        role: "STUDENT",
      },
    }),
    prisma.user.upsert({
      where: { email: "carol@student.demo" },
      update: {},
      create: {
        email: "carol@student.demo",
        passwordHash: studentPassword,
        name: "Carol Martinez",
        role: "STUDENT",
      },
    }),
    prisma.user.upsert({
      where: { email: "raj@student.demo" },
      update: {},
      create: {
        email: "raj@student.demo",
        passwordHash: studentPassword,
        name: "Raj Patel",
        role: "STUDENT", // For Equivalency Demo
      },
    }),
    prisma.user.upsert({
      where: { email: "olena@student.demo" },
      update: {},
      create: {
        email: "olena@student.demo",
        passwordHash: studentPassword,
        name: "Olena Shevchenko",
        role: "STUDENT", // For Refugee Recovery Demo
      },
    }),
  ]);

  console.log("✅ 5 student accounts created");

  // ── 5. Create Recruiter User & Jobs (AI Matching Demo) ────────────────
  const recruiterPassword = await bcrypt.hash("recruiter123", 10);
  const recruiter = await prisma.user.upsert({
    where: { email: "hr@techcorp.demo" },
    update: {},
    create: {
      email: "hr@techcorp.demo",
      passwordHash: recruiterPassword,
      name: "TechCorp HR Manager",
      role: "RECRUITER",
    },
  });

  // Seed some jobs
  await prisma.jobPosting.createMany({
    data: [
      {
        recruiterId: recruiter.id,
        title: "Senior AI Engineer",
        company: "TechCorp Global",
        location: "San Francisco, CA (Hybrid)",
        description: "Looking for an expert in Machine Learning and Blockchain.",
        requiredCredTypes: "DEGREE,CERTIFICATE",
        requiredKeywords: "machine learning, blockchain, computer science",
        minReputationScore: 90,
        salaryRange: "$150k - $200k",
      },
      {
        recruiterId: recruiter.id,
        title: "Data Science Lead",
        company: "DataWorks Analytics",
        location: "Remote",
        description: "Lead our data science team.",
        requiredCredTypes: "DEGREE,DIPLOMA",
        requiredKeywords: "data science, economics",
        minReputationScore: 80,
        salaryRange: "$130k - $170k",
      },
    ],
  });

  console.log("✅ Recruiter & Jobs created (AI Job Matching Demo)");

  // ── 6. Issue Credentials (with Expiry & Merkle Roots) ─────────────────
  const now = new Date();
  const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const expiringSoon = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // Expires in 15 days
  const expired = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // Expired 5 days ago

  const credentials = [
    {
      studentIdx: 0,
      institution: mit,
      type: "DEGREE",
      title: "Bachelor of Science in Computer Science",
      recipientName: "Alice Johnson",
      issueDate: new Date("2022-06-15"),
    },
    {
      studentIdx: 0,
      institution: stanford,
      type: "CERTIFICATE",
      title: "Advanced Machine Learning Certificate",
      recipientName: "Alice Johnson",
      issueDate: past30Days,
      expiryDate: expiringSoon, // For Skill-Decay Demo
    },
    {
      studentIdx: 1,
      institution: mit,
      type: "DEGREE",
      title: "Master of Engineering in Electrical Engineering",
      recipientName: "Bob Williams",
      issueDate: new Date("2024-08-30"),
    },
    {
      studentIdx: 2,
      institution: stanford,
      type: "DIPLOMA",
      title: "Graduate Diploma in Data Science",
      recipientName: "Carol Martinez",
      issueDate: new Date("2025-03-10"),
    },
    {
      studentIdx: 3,
      institution: iit,
      type: "DEGREE",
      title: "B.Tech in Computer Science and Engineering", // For Equivalency Demo
      recipientName: "Raj Patel",
      issueDate: new Date("2023-08-10"),
    },
    {
      studentIdx: 4, // Olena
      institution: kyiv,
      type: "CERTIFICATE",
      title: "First Aid & Emergency Response Training",
      recipientName: "Olena Shevchenko",
      issueDate: new Date("2023-01-10"),
      expiryDate: expired, // For Expiry/Decay Demo
    },
  ];

  let credCount = 0;
  for (const cred of credentials) {
    const hashInput = JSON.stringify({
      institutionId: cred.institution.id,
      studentId: students[cred.studentIdx].id,
      credentialType: cred.type,
      title: cred.title,
      recipientName: cred.recipientName,
      issueDate: cred.issueDate.toISOString(),
    });

    const credentialHash = hashData(hashInput);

    const existing = await prisma.credential.findUnique({
      where: { credentialHash },
    });
    if (existing) continue;

    await prisma.credential.create({
      data: {
        credentialHash,
        studentId: students[cred.studentIdx].id,
        institutionId: cred.institution.id,
        credentialType: cred.type,
        title: cred.title,
        recipientName: cred.recipientName,
        issueDate: cred.issueDate,
        expiryDate: cred.expiryDate || null,
        status: "VALID",
        signature: crypto.createHmac("sha256", "demo-key").update(credentialHash).digest("hex"),
      },
    });
    credCount++;
  }

  // Generate a Merkle Batch Demo
  const batchId = "batch-demo-2024";
  const fakeRoot = hashData("demo-merkle-root");
  await prisma.credential.upsert({
    where: { credentialHash: hashData("merkle-cred-1") },
    update: {},
    create: {
      credentialHash: hashData("merkle-cred-1"),
      studentId: students[1].id,
      institutionId: mit.id,
      credentialType: "MICRO_CREDENTIAL",
      title: "Cloud Computing Fundamentals",
      recipientName: "Bob Williams",
      issueDate: new Date(),
      status: "VALID",
      batchId,
      merkleRoot: fakeRoot,
      merkleProof: ["0xabc", "0xdef"],
    },
  });

  console.log(`✅ Credentials issued (including expiry and merkle demos)`);

  // ── 7. Refugee Recovery Demo ──────────────────────────────────────────
  await prisma.recoveryRequest.create({
    data: {
      studentId: students[4].id, // Olena
      institutionId: kyiv.id,
      originalTitle: "Bachelor of Science in Applied Mathematics",
      originalType: "DEGREE",
      originalDate: "2021",
      evidenceNotes: "Paper degree was lost during relocation. Student ID #49281.",
      status: "PENDING",
    },
  });
  console.log("✅ Seeded Refugee Recovery Request");

  // ── 8. Plagiarism Detection Demo (Thesis Fingerprints) ────────────────
  await prisma.thesisFingerprint.createMany({
    data: [
      {
        fingerprint: "a3b9f1c72d8e40a5", // Fake hex SimHash
        title: "Optimization Algorithms in Distributed Networks",
        authorName: "Alice Johnson",
        institutionId: mit.id,
        wordCount: 15400,
      },
      {
        fingerprint: "a3b9f1c72d8e40a6", // Very similar hash (1 bit diff)
        title: "Distributed Network Optimization Algorithms",
        authorName: "Eve (Plagiarizer)",
        institutionId: stanford.id,
        wordCount: 15350,
      }
    ],
  });
  console.log("✅ Seeded Thesis Fingerprints (Plagiarism Demo)");

  // ── 9. Micro-Credential Stacking Demo ─────────────────────────────────
  const aliceProfile = await prisma.skillProfile.create({
    data: {
      userId: students[0].id,
      title: "Alice's AI & Blockchain Profile",
      bio: "Full-stack engineer specializing in AI integration.",
      totalScore: 92.5,
    },
  });

  const aliceCreds = await prisma.credential.findMany({ where: { studentId: students[0].id } });
  for (const c of aliceCreds) {
    await prisma.skillProfileEntry.create({
      data: {
        profileId: aliceProfile.id,
        credentialId: c.id,
        skillTag: c.title.includes("Machine") ? "AI/ML" : "Computer Science",
        weight: 1.5,
      },
    });
  }
  console.log("✅ Seeded Micro-Credential Skill Profile");

  console.log("\n🎉 Database seeded successfully for ABSOLUTE WIN!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
