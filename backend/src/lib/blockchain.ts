import { ethers } from "ethers";
import { config } from "../config";
import fs from "fs";
import path from "path";

// Load contract ABI and address from deployment output
let contractABI: any[] = [];
let contractAddress: string = config.contractAddress;

const contractConfigPath = path.join(__dirname, "..", "config", "contract.json");
if (fs.existsSync(contractConfigPath)) {
  const contractConfig = JSON.parse(fs.readFileSync(contractConfigPath, "utf8"));
  contractABI = contractConfig.abi;
  if (!contractAddress) {
    contractAddress = contractConfig.address;
  }
}

// Provider & signer
let provider: ethers.JsonRpcProvider;
let signer: ethers.Wallet;
let contract: ethers.Contract | null = null;

export function initBlockchain() {
  try {
    provider = new ethers.JsonRpcProvider(config.rpcUrl);
    signer = new ethers.Wallet(config.privateKey, provider);

    if (contractAddress && contractABI.length > 0) {
      contract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log(`⛓️  Connected to contract at ${contractAddress}`);
    } else {
      console.warn(
        "⚠️  No contract address/ABI found. Blockchain features disabled."
      );
      console.warn(
        "   Run 'npm run deploy:contracts' from root to deploy and generate config."
      );
    }
  } catch (error) {
    console.error("❌ Blockchain init failed:", error);
  }
}

import { withRetry } from "./retry";

/**
 * Issue a credential hash on-chain
 */
export async function issueCredentialOnChain(
  credentialHash: string,
  metadataURI: string
): Promise<{ txHash: string; blockNumber: number } | null> {
  if (!contract) {
    console.warn("⚠️  Blockchain not initialized — skipping on-chain issuance");
    return null;
  }

  return withRetry(async () => {
    // We use a fresh nonce on each attempt in case a previous attempt got stuck or dropped
    const nonce = await signer.getNonce("latest");
    const tx = await contract!.issueCredential(credentialHash, metadataURI, { nonce });
    const receipt = await tx.wait();
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }, { retries: 3, initialDelay: 2000 });
}

/**
 * Revoke a credential on-chain
 */
export async function revokeCredentialOnChain(
  credentialHash: string,
  reason: string
): Promise<{ txHash: string } | null> {
  if (!contract) {
    console.warn("⚠️  Blockchain not initialized — skipping on-chain revocation");
    return null;
  }

  return withRetry(async () => {
    const nonce = await signer.getNonce("latest");
    const tx = await contract!.revokeCredential(credentialHash, reason, { nonce });
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }, { retries: 3, initialDelay: 2000 });
}

/**
 * Verify a credential on-chain
 */
export async function verifyCredentialOnChain(credentialHash: string): Promise<{
  exists: boolean;
  revoked: boolean;
  issuer: string;
  timestamp: number;
  metadataURI: string;
} | null> {
  if (!contract) {
    return null;
  }

  try {
    const result = await contract.verifyCredential(credentialHash);
    return {
      exists: result[0],
      revoked: result[1],
      issuer: result[2],
      timestamp: Number(result[3]),
      metadataURI: result[4],
    };
  } catch (error: any) {
    console.error("❌ On-chain verification failed:", error.message);
    return null;
  }
}

/**
 * Register an institution on-chain
 */
export async function registerInstitutionOnChain(
  institutionAddress: string,
  name: string
): Promise<{ txHash: string } | null> {
  if (!contract) {
    console.warn("⚠️  Blockchain not initialized — skipping on-chain registration");
    return null;
  }

  try {
    const tx = await contract.registerInstitution(institutionAddress, name);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (error: any) {
    console.error("❌ On-chain institution registration failed:", error.message);
    throw error;
  }
}

export function getProvider() {
  return provider;
}

export function getSigner() {
  return signer;
}

export function getContract() {
  return contract;
}

export function getContractAddress() {
  return contractAddress;
}
