const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const demoVideos = [
  {
    mediaUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    name: "nse_ceo_advisory.mp4",
    confidence: 98.7,
    anomalies: JSON.stringify([
      { type: "LIP_SYNC", timeSec: 2.5, severity: "HIGH" },
      { type: "BLINK_RATE", timeSec: 4.1, severity: "MEDIUM" }
    ])
  },
  {
    mediaUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    name: "hdfc_chairman_fake.mp4",
    confidence: 94.2,
    anomalies: JSON.stringify([
      { type: "PULSE_RATE_INCONSISTENCY", timeSec: 5.2, severity: "HIGH" }
    ])
  },
  {
    mediaUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    name: "adani_statement_fake.mp4",
    confidence: 99.1,
    anomalies: JSON.stringify([
      { type: "VOICE_CLONING_ARTIFACTS", timeSec: 1.5, severity: "HIGH" },
      { type: "LIP_SYNC", timeSec: 3.4, severity: "HIGH" }
    ])
  },
  {
    mediaUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    name: "sebi_chairperson_deepfake.mp4",
    confidence: 88.5,
    anomalies: JSON.stringify([
      { type: "FACIAL_BLURRING", timeSec: 6.1, severity: "MEDIUM" }
    ])
  },
  {
    mediaUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    name: "rbi_governor_clone.mp4",
    confidence: 96.8,
    anomalies: JSON.stringify([
      { type: "SYNTHETIC_AUDIO", timeSec: 0.5, severity: "HIGH" },
      { type: "MICRO_EXPRESSIONS_MISSING", timeSec: 2, severity: "MEDIUM" }
    ])
  },
  {
    mediaUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    name: "zerodha_founder_scam.mp4",
    confidence: 91.4,
    anomalies: JSON.stringify([
      { type: "UNNATURAL_LIGHTING", timeSec: 3.5, severity: "HIGH" }
    ])
  },
  {
    mediaUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    name: "reliance_agm_doctored.mp4",
    confidence: 85.0,
    anomalies: JSON.stringify([
      { type: "BACKGROUND_WARPING", timeSec: 8.0, severity: "LOW" }
    ])
  },
  {
    mediaUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    name: "infosys_earnings_fake.mp4",
    confidence: 99.9,
    anomalies: JSON.stringify([
      { type: "FULL_FACE_SWAP", timeSec: 1.0, severity: "CRITICAL" },
      { type: "VOICE_CLONING_ARTIFACTS", timeSec: 4.5, severity: "HIGH" }
    ])
  }
];

async function main() {
  console.log("Deleting old deepfake records...");
  await prisma.deepfakeRecord.deleteMany();

  console.log("Inserting 8 demo videos...");
  for (const video of demoVideos) {
    // Append name as a query param so the frontend can extract the filename for the UI
    const urlWithName = `${video.mediaUrl}?name=${video.name}`;
    await prisma.deepfakeRecord.create({
      data: {
        mediaUrl: urlWithName,
        confidence: video.confidence,
        anomalies: video.anomalies,
      }
    });
  }
  
  console.log("Successfully seeded 8 demo videos!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
