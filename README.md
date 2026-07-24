<div align="center">
  <img src="./frontend/public/logo.svg" alt="ProofMind Logo" width="120" />
  <h1 align="center">ProofMind</h1>
  <p align="center">
    <strong>Trust Every Degree. Verify Every Achievement.</strong>
  </p>
  <p align="center">
    A decentralized, AI-powered platform for tamper-proof academic credential verification.
  </p>
  
  <p align="center">
    <a href="https://github.com/yourusername/proofmind"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge" alt="License" /></a>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://polygon.technology/"><img src="https://img.shields.io/badge/Polygon-7B3FE4?style=for-the-badge&logo=polygon&logoColor=white" alt="Polygon" /></a>
    <a href="https://deepmind.google/technologies/gemini/"><img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" /></a>
    <a href="https://clerk.com/"><img src="https://img.shields.io/badge/Clerk_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk Auth" /></a>
  </p>
</div>

<hr />

## 🌟 Vision

In a world where degree mills and fabricated resumes run rampant, verifying academic credentials has become a slow, expensive, and manual process. **ProofMind** revolutionizes the academic ecosystem by replacing phone calls and emails to university registrars with instantaneous, cryptographic verification on the **Polygon blockchain**.

If an institution issues it on ProofMind, it is **mathematically guaranteed to be authentic**.

## ✨ Key Features

- **🔗 Cryptographic Immutability**: Every credential is hashed (SHA-256) and permanently anchored to the Polygon blockchain. It cannot be altered or forged.
- **⚡ Instant Verification**: Employers and recruiters can scan a QR code or paste a credential hash to receive a tamper-proof verification in under 2 seconds. No login required.
- **👁️ Digital Forensics Engine**: Upload any credential PDF to run a deep forensic analysis using `pdf-lib` and `sharp` to detect tampering, metadata manipulation, or forged digital signatures.
- **🛡️ Verification-Integrity Module**: A robust microservice that acts as the source of truth, cross-referencing off-chain records against on-chain transaction logs and IPFS CIDs to guarantee data integrity.
- **🏛️ DigiLocker Integration**: Students can seamlessly sync and fetch government-issued verifiable credentials through a secure, mock Digilocker API layer.
- **🤖 AI-Powered Job Matching**: Integrated with **Google Gemini AI**, the platform semantically matches a student's verified skills and degrees to active job postings, acting as a hyper-intelligent technical recruiter.
- **🎓 AI Equivalency Engine**: Cross-border credentials are automatically mapped to local qualification frameworks using an AI evaluation engine (e.g., mapping an Indian B.Tech to a US B.S. in Engineering).
- **🔒 Enterprise Auth via Clerk**: Bank-grade authentication and user management powered by Clerk, ensuring secure identity verification for Universities and Students.

---

## 🏗️ Architecture

ProofMind is built on a modern, robust, and scalable tech stack:

```text
proofmind/
├── contracts/          # Solidity smart contracts (Hardhat, Ethers.js)
├── backend/            # Node.js + Express API (Prisma, PostgreSQL, Gemini SDK)
├── frontend/           # Next.js 14, Tailwind CSS, Framer Motion, Three.js
└── demo-data/          # Synthetic demo assets (QR codes, mocked certificates)
```

**Core Technologies:**
- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion, Clerk UI components
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL, `@clerk/express`, Google Gemini GenAI SDK
- **Web3**: Solidity, Hardhat, Ethers.js, Polygon Network, IPFS (Pinata)
- **Security**: Clerk Authentication, helmet, Rate Limiting, Digital Forensics (pdf-lib, sharp)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL)
- An active [Google Gemini API Key](https://aistudio.google.com/)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/proofmind.git
cd proofmind

# Install dependencies for all workspaces
npm run install:all
```

### 2. Environment Configuration
Copy the `.env.example` file to `.env` in the root directory:
```bash
cp .env.example .env
```
Ensure you insert your **Gemini API Key**:
```env
GEMINI_API_KEY="YOUR_API_KEY_HERE"
```
*(Note: If the key is omitted or rate-limited, the system will gracefully degrade to a highly-optimized local heuristic engine.)*

### 3. Spin Up Infrastructure
```bash
# Start PostgreSQL Database
docker-compose up -d

# Push schema and seed the database with robust demo data
cd backend
npx prisma db push
npx tsx prisma/seed.ts
cd ..
```

### 4. Deploy Smart Contracts (Local Testnet)
```bash
# Terminal 1: Start local Hardhat blockchain
cd contracts
npx hardhat node

# Terminal 2: Deploy the ProofMindRegistry contract
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Launch the Application
```bash
# Terminal 1: Start Backend API (Port 4000)
cd backend
npm run dev

# Terminal 2: Start Frontend App (Port 3000)
cd frontend
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 👤 Demo Accounts

The database seed provides several pre-configured profiles. Simply sign in via Clerk using the matching email address to be automatically mapped to these roles (or sign up as a new user to receive the default Student role):

| Persona | Email | Role Features |
|---------|-------|---------------|
| **Admin** | `admin@proofmind.io` | Analytics dashboard, institution verification |
| **University** | `registrar@mit-demo.edu` | Issue credentials, digital forensics, revoke |
| **Student** | `alice@student.demo` | Digital wallet, DigiLocker sync, AI job matching |
| **Recruiter** | `hr@techcorp.demo` | Post jobs, source verified candidates |

---

## 🔒 Security Posture

ProofMind takes trust and security seriously:
- **Zero PII on Chain**: We never store Personally Identifiable Information on the blockchain. We only store a cryptographic SHA-256 hash of the credential data, ensuring 100% GDPR compliance.
- **ECDSA Signatures**: Ensures that only verified institutional wallets can interact with the registry contract.
- **Decentralized Storage**: Certificate PDFs and metadata are pinned securely to IPFS, eliminating single points of failure.
- **Failover Redundancy**: AI integrations are backed by deterministic local heuristic engines to guarantee uptime even during API outages.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">
  <br/>
  <p>Built with ❤️ to secure the future of academic achievements.</p>
</div>
# proofmind
