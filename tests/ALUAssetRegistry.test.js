const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ALU Assignment Contracts", function () {
  let registry, token, deployer, addr1;
  const validHash = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd";
  const invalidHash = "0x1234561234561234561234561234561234561234561234561234561234561234";

  beforeEach(async function () {
    [deployer, addr1] = await ethers.getSigners();

    // Deploy Registry
    const Registry = await ethers.getContractFactory("ALUAssetRegistry");
    registry = await Registry.deploy();

    // Deploy Token
    const Token = await ethers.getContractFactory("ALULogoToken");
    token = await Token.deploy(deployer.address);
  });

  describe("ALUAssetRegistry", function () {
    it("The ALU logo registers successfully and returns a token ID", async function () {
      await expect(registry.registerAsset("ALU Logo", "png", validHash))
        .to.emit(registry, "AssetRegistered")
        .withArgs(1, validHash, deployer.address);
    });

    it("Attempting to register the same hash a second time is rejected", async function () {
      await registry.registerAsset("ALU Logo", "png", validHash);
      await expect(
        registry.registerAsset("ALU Logo Copy", "png", validHash)
      ).to.be.revertedWith("ERROR: This content hash is already registered.");
    });

    it("verifyLogoIntegrity() returns true when the correct hash is supplied", async function () {
      await registry.registerAsset("ALU Logo", "png", validHash);
      const [isValid, message] = await registry.verifyLogoIntegrity(1, validHash);
      expect(isValid).to.equal(true);
      expect(message).to.equal("Logo is authentic.");
    });

    it("verifyLogoIntegrity() returns false when an incorrect hash is supplied", async function () {
      await registry.registerAsset("ALU Logo", "png", validHash);
      const [isValid, message] = await registry.verifyLogoIntegrity(1, invalidHash);
      expect(isValid).to.equal(false);
      expect(message).to.equal("Warning: logo does not match.");
    });

    it("getAsset() returns the correct asset name and file type for a registered token", async function () {
      await registry.registerAsset("ALU Logo", "png", validHash);
      const asset = await registry.getAsset(1);
      expect(asset.assetName).to.equal("ALU Logo");
      expect(asset.fileType).to.equal("png");
    });
  });

  describe("ALULogoToken", function () {
    it("The full supply of 1,000,000 ALUT tokens is minted to the logo owner", async function () {
      const decimals = await token.decimals();
      const expectedSupply = ethers.parseUnits("1000000", decimals);
      expect(await token.balanceOf(deployer.address)).to.equal(expectedSupply);
    });

    it("distributeShares() correctly transfers tokens to a recipient address", async function () {
      await token.distributeShares(addr1.address, 50000);
      const decimals = await token.decimals();
      const expectedBalance = ethers.parseUnits("50000", decimals);
      expect(await token.balanceOf(addr1.address)).to.equal(expectedBalance);
    });

    it("ownershipPercentage() returns the correct percentage for a wallet", async function () {
      // Distribute 250,000 tokens
      await token.distributeShares(addr1.address, 250000);
      const percentage = await token.ownershipPercentage(addr1.address);
      expect(percentage).to.equal(25);
    });
  });
});
