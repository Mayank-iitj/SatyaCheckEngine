const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying ProofMindRegistry...");

  const ProofMindRegistry = await hre.ethers.getContractFactory("ProofMindRegistry");
  const registry = await ProofMindRegistry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log(`✅ ProofMindRegistry deployed to: ${contractAddress}`);

  // Save deployment info for the backend to consume
  const deploymentInfo = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    deployer: (await hre.ethers.getSigners())[0].address,
    deployedAt: new Date().toISOString(),
  };

  // Save to contracts directory
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Also copy ABI for the backend
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "ProofMindRegistry.sol",
    "ProofMindRegistry.json"
  );

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abiOutput = {
      abi: artifact.abi,
      address: contractAddress,
      network: hre.network.name,
    };

    // Save to backend's config directory
    const backendConfigDir = path.join(__dirname, "..", "..", "backend", "src", "config");
    if (!fs.existsSync(backendConfigDir)) {
      fs.mkdirSync(backendConfigDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(backendConfigDir, "contract.json"),
      JSON.stringify(abiOutput, null, 2)
    );
    console.log("📋 ABI + address saved to backend/src/config/contract.json");
  }

  console.log("\n📝 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
