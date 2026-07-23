import crypto from "crypto";

/**
 * Merkle Tree implementation for batch credential issuance.
 * Instead of writing one hash per credential on-chain (expensive),
 * universities issue an entire graduating class as one Merkle root,
 * with each student holding a Merkle proof for their individual credential.
 */

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function sortPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

function hashPair(a: string, b: string): string {
  const [first, second] = sortPair(a, b);
  return sha256(first + second);
}

export interface MerkleTree {
  root: string;
  leaves: string[];
  layers: string[][];
}

/**
 * Build a Merkle tree from an array of credential hashes.
 */
export function buildMerkleTree(hashes: string[]): MerkleTree {
  if (hashes.length === 0) {
    return { root: "", leaves: [], layers: [] };
  }

  // Normalize: strip 0x prefix and lowercase
  const leaves = hashes.map((h) => h.replace(/^0x/, "").toLowerCase());

  // Build layers bottom-up
  const layers: string[][] = [leaves];
  let currentLayer = leaves;

  while (currentLayer.length > 1) {
    const nextLayer: string[] = [];
    for (let i = 0; i < currentLayer.length; i += 2) {
      if (i + 1 < currentLayer.length) {
        nextLayer.push(hashPair(currentLayer[i], currentLayer[i + 1]));
      } else {
        // Odd node: promote to next layer
        nextLayer.push(currentLayer[i]);
      }
    }
    layers.push(nextLayer);
    currentLayer = nextLayer;
  }

  return {
    root: "0x" + currentLayer[0],
    leaves: hashes,
    layers,
  };
}

/**
 * Generate a Merkle proof for a specific leaf hash.
 */
export function getMerkleProof(tree: MerkleTree, leafHash: string): string[] {
  const leaf = leafHash.replace(/^0x/, "").toLowerCase();
  let index = tree.layers[0].indexOf(leaf);

  if (index === -1) {
    throw new Error("Leaf not found in tree");
  }

  const proof: string[] = [];

  for (let i = 0; i < tree.layers.length - 1; i++) {
    const layer = tree.layers[i];
    const isRight = index % 2 === 1;
    const siblingIndex = isRight ? index - 1 : index + 1;

    if (siblingIndex < layer.length) {
      proof.push("0x" + layer[siblingIndex]);
    }

    index = Math.floor(index / 2);
  }

  return proof;
}

/**
 * Verify a Merkle proof for a leaf against a root.
 */
export function verifyMerkleProof(
  leafHash: string,
  proof: string[],
  root: string
): boolean {
  let hash = leafHash.replace(/^0x/, "").toLowerCase();
  const targetRoot = root.replace(/^0x/, "").toLowerCase();

  for (const sibling of proof) {
    const sib = sibling.replace(/^0x/, "").toLowerCase();
    hash = hashPair(hash, sib);
  }

  return hash === targetRoot;
}

/**
 * Compute SimHash for plagiarism detection (fuzzy text fingerprinting).
 * SimHash produces a hash where similar documents have similar hashes,
 * allowing near-duplicate detection through Hamming distance.
 */
export function computeSimHash(text: string, bitSize: number = 64): string {
  // Tokenize: sliding 3-gram shingles
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  const shingles: string[] = [];
  for (let i = 0; i <= words.length - 3; i++) {
    shingles.push(words.slice(i, i + 3).join(" "));
  }

  if (shingles.length === 0) {
    return "0".repeat(bitSize / 4);
  }

  // Initialize bit vector
  const v = new Array(bitSize).fill(0);

  for (const shingle of shingles) {
    const hash = sha256(shingle);
    // Use first bitSize bits of the SHA-256 hash
    for (let i = 0; i < bitSize; i++) {
      const byteIndex = Math.floor(i / 8);
      const bitIndex = i % 8;
      const byte = parseInt(hash.substring(byteIndex * 2, byteIndex * 2 + 2), 16);
      const bit = (byte >> (7 - bitIndex)) & 1;
      v[i] += bit ? 1 : -1;
    }
  }

  // Convert to binary hash
  let result = "";
  for (let i = 0; i < bitSize; i += 4) {
    let nibble = 0;
    for (let j = 0; j < 4 && i + j < bitSize; j++) {
      nibble = (nibble << 1) | (v[i + j] > 0 ? 1 : 0);
    }
    result += nibble.toString(16);
  }

  return result;
}

/**
 * Compute Hamming distance between two SimHashes.
 * Low distance = likely plagiarism.
 */
export function hammingDistance(hash1: string, hash2: string): number {
  let distance = 0;
  const len = Math.min(hash1.length, hash2.length);

  for (let i = 0; i < len; i++) {
    const a = parseInt(hash1[i], 16);
    const b = parseInt(hash2[i], 16);
    let xor = a ^ b;
    while (xor) {
      distance += xor & 1;
      xor >>= 1;
    }
  }

  return distance;
}

/**
 * Determine plagiarism similarity percentage from Hamming distance.
 */
export function similarityFromHamming(distance: number, bitSize: number = 64): number {
  return Math.max(0, Math.round((1 - distance / bitSize) * 100));
}
