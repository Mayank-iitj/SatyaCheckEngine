import { prisma } from "../src/lib/prisma";

// Mock external services before running tests
jest.mock("../src/lib/blockchain", () => ({
  initBlockchain: jest.fn(),
  issueCredentialOnChain: jest.fn().mockResolvedValue({ txHash: "0xMockTxHash", blockNumber: 1 }),
  revokeCredentialOnChain: jest.fn().mockResolvedValue({ txHash: "0xMockRevokeTxHash" }),
  verifyCredentialOnChain: jest.fn().mockResolvedValue({
    exists: true,
    revoked: false,
    issuer: "0xMockIssuer",
    timestamp: Date.now(),
    metadataURI: "satyacheck://mock",
  }),
}));

jest.mock("../src/lib/ipfs", () => ({
  uploadToIPFS: jest.fn().mockResolvedValue({ cid: "mockCid", uri: "ipfs://mockCid" }),
  getIPFSUrl: jest.fn().mockReturnValue("https://mock-gateway/ipfs/mockCid"),
}));

afterAll(async () => {
  await prisma.$disconnect();
});
