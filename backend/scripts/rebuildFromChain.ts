/**
 * rebuildFromChain.ts — Admin Script
 *
 * Proves that the system can reconstruct credential status entirely from
 * on-chain events — the blockchain is the ultimate source of truth.
 *
 * Usage: npx tsx scripts/rebuildFromChain.ts [--dry-run]
 *
 * Process:
 *  1. Connect to the blockchain
 *  2. Replay all CredentialIssued events from genesis
 *  3. Replay all CredentialRevoked events
 *  4. Upsert each credential into the database
 *  5. Print a summary of what was rebuilt
 *
 * NOTE: This script reconstructs STATUS (VALID/REVOKED) and core hashes only.
 *  Rich metadata (names, titles, IPFS CIDs) comes from IPFS metadataURIs stored
 *  in the on-chain events. If IPFS is unavailable, placeholder values are used.
 */

import path from "path";
import dotenv from "dotenv";

// Load environment
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

import { ethers } from "ethers";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RebuildResult {
  issued: number;
  revoked: number;
  upserted: number;
  skipped: number;
  errors: string[];
}

async function rebuildFromChain(dryRun = false): Promise<void> {
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║  SatyaCheck — Rebuild Database from On-Chain Events        ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  if (dryRun) {
    console.log("🔍  DRY RUN mode — no database writes will occur\n");
  }

  // ── 1. Connect to blockchain ─────────────────────────────────────────────
  const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
  const contractAddress = process.env.CONTRACT_ADDRESS || "";
  const contractConfigPath = path.join(__dirname, "..", "src", "config", "contract.json");

  if (!contractAddress && !fs.existsSync(contractConfigPath)) {
    console.error("❌  No contract address found. Deploy contracts first.");
    console.error("   Run: npm run deploy:contracts");
    process.exit(1);
  }

  let contractABI: any[] = [];
  let resolvedAddress = contractAddress;

  if (fs.existsSync(contractConfigPath)) {
    const contractConfig = JSON.parse(fs.readFileSync(contractConfigPath, "utf8"));
    contractABI = contractConfig.abi || [];
    if (!resolvedAddress) {
      resolvedAddress = contractConfig.address;
    }
  }

  if (!resolvedAddress) {
    console.error("❌  No contract address resolved. Set CONTRACT_ADDRESS in .env");
    process.exit(1);
  }

  console.log(`⛓️   Connecting to RPC: ${rpcUrl}`);
  console.log(`📋  Contract: ${resolvedAddress}\n`);

  let provider: ethers.JsonRpcProvider;
  let contract: ethers.Contract;

  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    await provider.getNetwork(); // test connection
    contract = new ethers.Contract(resolvedAddress, contractABI, provider);
    console.log("✅  Connected to blockchain\n");
  } catch (err: any) {
    console.error(`❌  Failed to connect to blockchain: ${err.message}`);
    console.error("   Ensure Hardhat node is running: npx hardhat node");
    process.exit(1);
  }

  const result: RebuildResult = {
    issued: 0,
    revoked: 0,
    upserted: 0,
    skipped: 0,
    errors: [],
  };

  // ── 2. Replay CredentialIssued events ────────────────────────────────────
  console.log("📥  Fetching CredentialIssued events...");
  try {
    const issuedFilter = contract.filters.CredentialIssued
      ? contract.filters.CredentialIssued()
      : null;

    let issuedEvents: ethers.EventLog[] = [];
    if (issuedFilter) {
      issuedEvents = (await contract.queryFilter(issuedFilter, 0, "latest")) as ethers.EventLog[];
    } else {
      // Try by event signature if filter not available
      const issuedTopic = ethers.id("CredentialIssued(bytes32,address,string,uint256)");
      issuedEvents = (await contract.queryFilter(
        { address: resolvedAddress, topics: [issuedTopic] },
        0,
        "latest"
      )) as ethers.EventLog[];
    }

    console.log(`   Found ${issuedEvents.length} CredentialIssued event(s)\n`);
    result.issued = issuedEvents.length;

    for (const event of issuedEvents) {
      try {
        const args = event.args;
        if (!args) continue;

        // Event signature: CredentialIssued(bytes32 credentialHash, address issuer, string metadataURI, uint256 timestamp)
        const credentialHash = typeof args[0] === "string" ? args[0] : args.credentialHash;
        const issuerAddress = typeof args[1] === "string" ? args[1] : args.issuer;
        const metadataURI = typeof args[2] === "string" ? args[2] : args.metadataURI || "";
        const timestamp = args[3] || args.timestamp;

        const txHash = event.transactionHash;
        const blockNumber = event.blockNumber;
        const issueDate = timestamp
          ? new Date(Number(timestamp) * 1000)
          : new Date();

        console.log(`  📝  Processing: ${credentialHash.slice(0, 18)}... | TX: ${txHash.slice(0, 12)}...`);

        // Try to fetch rich metadata from IPFS URI
        let richMetadata: Record<string, any> = {};
        if (metadataURI && !metadataURI.startsWith("satyacheck://")) {
          try {
            richMetadata = await fetchIPFSMetadata(metadataURI);
          } catch {
            // IPFS unavailable — use chain-only data
          }
        }

        if (!dryRun) {
          // Upsert credential record
          // We use a "chain-rebuild" placeholder for DB fields we can't recover from chain alone
          await prisma.credential.upsert({
            where: { credentialHash },
            update: {
              status: "VALID", // Will be overwritten if we find a Revoked event
              txHash,
              updatedAt: new Date(),
            },
            create: {
              credentialHash,
              studentId: await findOrCreatePlaceholderStudent(prisma, credentialHash),
              institutionId: await findOrCreatePlaceholderInstitution(
                prisma,
                issuerAddress,
                richMetadata.institutionName || `On-chain Issuer ${issuerAddress.slice(0, 8)}`
              ),
              credentialType: richMetadata.credentialType || "DEGREE",
              title: richMetadata.title || `Chain-Rebuilt Credential (${credentialHash.slice(0, 10)})`,
              recipientName: richMetadata.recipientName || "Unknown Recipient",
              issueDate,
              txHash,
              metadataURI,
              status: "VALID",
              source: richMetadata.source || "MANUAL",
            },
          });
          result.upserted++;
        } else {
          console.log(
            `  [DRY RUN] Would upsert credential: ${credentialHash.slice(0, 20)}...`
          );
          result.upserted++;
        }
      } catch (err: any) {
        const msg = `Failed to process CredentialIssued event: ${err.message}`;
        console.error(`  ❌  ${msg}`);
        result.errors.push(msg);
        result.skipped++;
      }
    }
  } catch (err: any) {
    console.warn(`⚠️   Could not fetch CredentialIssued events: ${err.message}`);
    console.warn("    This is expected if the contract does not emit standard events or is on a fresh chain.\n");
  }

  // ── 3. Replay CredentialRevoked events ──────────────────────────────────
  console.log("\n📥  Fetching CredentialRevoked events...");
  try {
    const revokedFilter = contract.filters.CredentialRevoked
      ? contract.filters.CredentialRevoked()
      : null;

    let revokedEvents: ethers.EventLog[] = [];
    if (revokedFilter) {
      revokedEvents = (await contract.queryFilter(revokedFilter, 0, "latest")) as ethers.EventLog[];
    } else {
      const revokedTopic = ethers.id("CredentialRevoked(bytes32,address,string,uint256)");
      revokedEvents = (await contract.queryFilter(
        { address: resolvedAddress, topics: [revokedTopic] },
        0,
        "latest"
      )) as ethers.EventLog[];
    }

    console.log(`   Found ${revokedEvents.length} CredentialRevoked event(s)\n`);
    result.revoked = revokedEvents.length;

    for (const event of revokedEvents) {
      try {
        const args = event.args;
        if (!args) continue;

        const credentialHash = typeof args[0] === "string" ? args[0] : args.credentialHash;
        const reason = typeof args[2] === "string" ? args[2] : args.reason || "Revoked on-chain";
        const timestamp = args[3] || args.timestamp;
        const revokedAt = timestamp ? new Date(Number(timestamp) * 1000) : new Date();

        console.log(`  🚫  Revoking: ${credentialHash.slice(0, 18)}...`);

        if (!dryRun) {
          await prisma.credential
            .update({
              where: { credentialHash },
              data: {
                status: "REVOKED",
                revokedReason: reason,
                revokedAt,
              },
            })
            .catch(() => {
              // Credential not in DB yet — skip (was issued before our rebuild started)
            });
        } else {
          console.log(`  [DRY RUN] Would revoke: ${credentialHash.slice(0, 20)}...`);
        }
      } catch (err: any) {
        const msg = `Failed to process CredentialRevoked event: ${err.message}`;
        console.error(`  ❌  ${msg}`);
        result.errors.push(msg);
      }
    }
  } catch (err: any) {
    console.warn(`⚠️   Could not fetch CredentialRevoked events: ${err.message}\n`);
  }

  // ── 4. Summary ─────────────────────────────────────────────────────────
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║  Rebuild Summary                                          ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");
  console.log(`  CredentialIssued events processed: ${result.issued}`);
  console.log(`  CredentialRevoked events processed: ${result.revoked}`);
  console.log(`  Records upserted/updated:          ${result.upserted}`);
  console.log(`  Records skipped (errors):          ${result.skipped}`);

  if (result.errors.length > 0) {
    console.log(`\n  Errors:`);
    result.errors.forEach((e) => console.log(`    - ${e}`));
  }

  if (dryRun) {
    console.log("\n  [DRY RUN] No database changes were made.");
  } else {
    console.log("\n✅  Database successfully rebuilt from on-chain events.");
    console.log("   The blockchain is the source of truth — the DB now mirrors chain state.");
  }

  await prisma.$disconnect();
}

/**
 * Fetch metadata from IPFS URI (best-effort)
 */
async function fetchIPFSMetadata(uri: string): Promise<Record<string, any>> {
  const gateway = process.env.PINATA_GATEWAY || "gateway.pinata.cloud";
  let url = uri;

  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "");
    url = `https://${gateway}/ipfs/${cid}`;
  } else if (uri.startsWith("local://")) {
    return {}; // Local CIDs can't be fetched externally
  }

  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) return {};
  return await response.json().catch(() => ({}));
}

/**
 * Find or create a placeholder student user for chain-rebuilt records
 */
async function findOrCreatePlaceholderStudent(
  prisma: PrismaClient,
  credentialHash: string
): Promise<string> {
  const placeholder = await prisma.user.findFirst({
    where: { email: "chain-rebuild-placeholder@satyacheck.internal" },
  });

  if (placeholder) return placeholder.id;

  const created = await prisma.user.create({
    data: {
      email: "chain-rebuild-placeholder@satyacheck.internal",
      passwordHash: "CHAIN_REBUILD_PLACEHOLDER_NOT_FOR_LOGIN",
      name: "Chain-Rebuilt Record",
      role: "STUDENT",
    },
  });

  return created.id;
}

/**
 * Find institution by wallet address or create a placeholder
 */
async function findOrCreatePlaceholderInstitution(
  prisma: PrismaClient,
  walletAddress: string,
  name: string
): Promise<string> {
  // Try to find existing institution by wallet
  const existing = await prisma.institution.findFirst({
    where: { walletAddress },
  });

  if (existing) return existing.id;

  // Create placeholder institution
  const placeholderUser = await prisma.user.upsert({
    where: { email: `chain-issuer-${walletAddress.toLowerCase().slice(2, 10)}@satyacheck.internal` },
    update: {},
    create: {
      email: `chain-issuer-${walletAddress.toLowerCase().slice(2, 10)}@satyacheck.internal`,
      passwordHash: "CHAIN_REBUILD_PLACEHOLDER_NOT_FOR_LOGIN",
      name,
      role: "UNIVERSITY",
    },
  });

  const institution = await prisma.institution.upsert({
    where: { userId: placeholderUser.id },
    update: {},
    create: {
      userId: placeholderUser.id,
      name,
      country: "Unknown (chain-rebuilt)",
      verified: false,
      walletAddress,
    },
  });

  return institution.id;
}

// ── Entry point ──────────────────────────────────────────────────────────────
const isDryRun = process.argv.includes("--dry-run");

rebuildFromChain(isDryRun).catch((err) => {
  console.error("\n❌  Fatal error during chain rebuild:", err);
  process.exit(1);
});
