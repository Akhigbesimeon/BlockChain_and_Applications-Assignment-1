const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  const logoHash = "0x56059b785a9e1a05a6714e1d783141c7e4f3cca5270aebd2a37bbac0ec009ed7";

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
