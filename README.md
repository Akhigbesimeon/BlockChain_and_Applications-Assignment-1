# ALU Asset Registry & Tokenization System (Assignment-1)

## Project Description
This project implements a decentralized intellectual property and fractional ownership system for African Leadership University (ALU). It consists of two smart contracts that work in collaboration to secure and distribute digital assets. The `ALUAssetRegistry` contract serves as an immutable registry where digital assets (such as the official ALU logo) are anchored to the blockchain using unique SHA-256 content hashes to prevent tampering or unauthorized duplicates. The `ALULogoToken` contract manages the financial and governance layer of the asset by minting a fixed supply of 1,000,000 utility tokens representing fractional shares of the registered asset. These tokens are initially minted to the asset owner, who can then distribute them to partners, stakeholders, or community members to fractionally share ownership or equity in the underlying digital asset.

## Registered Asset Verification
* **Asset Name:** `alu-logo.png`

* **File Type:** `png` 

* **Registered SHA-256 Hash:** `0xf32dc05242d2bb034eefabdf8dd4afc60d7f50b8eae92c2e73156e945cedacb5`

## Technical Specifications
* **Hardhat Version:** `^2.28.0`

* **Solidity Compiler Version:** `0.8.26`

* **EVM Target Block:** `cancun`

## Step-by-Step Instructions
### 1. Prerequisites & Installation
* Ensure you have Node.js installed on your local machine.
* Clone or download this repository to your local machine.
* Clean any conflicting package builds: `rm -rf node_modules package-lock.json`
* Install core Hardhat 2 framework and its official testing toolbox: `npm install --save-dev "hardhat@^2.28.0" "@nomicfoundation/hardhat-toolbox@hh2"`

* Install OpenZeppelin contract standards
`npm install @openzeppelin/contracts`

### Compile the Contracts
* Compile the Solidity code to generate the necessary artifacts and contract ABIs: `npx hardhat compile`

### Run the Test Suite
* Execute the 8 automated test specs to verify contract restrictions, duplicate asset detection, security modifiers, and token allocation calculations: `npx hardhat test`

### Local Deployment
To deploy the contracts to a local private network environment, open two terminal windows:

* **Terminal 1 (Start Local Node):** `npx hardhat node`

* **Terminal 2 (Deploy Contracts):** `npx hardhat run scripts/deploy.js --network localhost`

## Development Challenges & Resolution Notes
### Hardhat Runtime vs. ES Module Conflicts
* **Problem:** The project initially specified "type": "module" in package.json. This caused internal plugin injection conflicts with Hardhat 2's native structure, resulting in TypeError: Cannot read properties of undefined (reading 'getSigners') because the ethers library was failing to attach to the Hardhat Runtime Environment (hre).

* **Resolution:** Removed "type": "module" from package.json to leverage standard Node.js CommonJS behaviors. Converted imports in hardhat.config.js and scripts/deploy.js to use standard Node.js require() patterns, matching the architectural design requirements of Hardhat 2.

### OpenZeppelin Version and EVM Mismatch
* **Problem:** The newly installed @openzeppelin/contracts required a minimum compiler of 0.8.24. Upgrading the compiler configuration to 0.8.26 triggered errors regarding the mcopy instruction: TypeError: The "mcopy" instruction is only available for Cancun-compatible VMs. This occurred because Hardhat defaults to compiling for older Ethereum EVM architectures ("Paris").

* **Resolution:** Updated hardhat.config.js to explicitly override the targeted virtual machine environment by hardcoding the settings configuration to target the modern cancun EVM block standard where the mcopy operation is valid.
