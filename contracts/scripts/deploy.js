const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying SatyaCheckRegistry...");

  const SatyaCheckRegistry = await hre.ethers.getContractFactory("SatyaCheckRegistry");
  const registry = await SatyaCheckRegistry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log(`✅ SatyaCheckRegistry deployed to: ${contractAddress}`);

  const signers = await hre.ethers.getSigners();
  const deployer = signers[0].address;

  // Automatically register the backend wallet (deployer) as an institution so it can issue credentials
  console.log(`\n⏳ Registering deployer (${deployer}) as an institution...`);
  const tx = await registry.registerInstitution(deployer, "System Admin");
  await tx.wait();
  console.log(`✅ Deployer registered as an institution!`);

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
    "SatyaCheckRegistry.sol",
    "SatyaCheckRegistry.json"
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
