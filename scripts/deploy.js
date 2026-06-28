const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  const logoHash = "0xf32dc05242d2bb034eefabdf8dd4afc60d7f50b8eae92c2e73156e945cedacb5";

  // Deploy Asset Registry
  const Registry = await hre.ethers.getContractFactory("ALUAssetRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("ALUAssetRegistry deployed to:", registryAddress);

  // Register the logo immediately
  const tx = await registry.registerAsset("ALU Official Logo", "image/png", logoHash);
  await tx.wait();
  console.log("ALU Logo registered on the blockchain.");

  // Deploy Token Contract
  const Token = await hre.ethers.getContractFactory("ALULogoToken");
  const token = await Token.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("ALULogoToken deployed to:", tokenAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
