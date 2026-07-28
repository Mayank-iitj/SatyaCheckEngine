import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

// Also try the root .env
dotenv.config({ path: path.join(__dirname, "..", "..", "..", ".env") });

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "10", 10),
  corsOrigin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === "production" ? "https://satyacheck.mayankiitj.in" : "http://localhost:3000"),

  // Blockchain
  rpcUrl: process.env.RPC_URL || "http://127.0.0.1:8545",
  privateKey:
    process.env.PRIVATE_KEY ||
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  contractAddress: process.env.CONTRACT_ADDRESS || "",
  chainId: parseInt(process.env.CHAIN_ID || "31337", 10),

  // IPFS
  ipfsProvider: (process.env.IPFS_PROVIDER || "local") as "local" | "pinata",
  pinataJwt: process.env.PINATA_JWT || "",
  pinataGateway: process.env.PINATA_GATEWAY || "",

  // App
  appUrl: process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "production" ? "https://satyacheck.mayankiitj.in" : "http://localhost:3000"),

  // Database
  databaseUrl: process.env.DATABASE_URL || "",

  // AI
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY || "",
};
