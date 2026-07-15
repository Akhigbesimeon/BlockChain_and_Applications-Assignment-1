# ALU Logo Registry & Distribution dApp

A full-stack decentralized application (dApp) built to register digital assets on an immutable ledger, verify file integrity via cryptographic hashing, and manage equity distribution through a custom ERC-20 governance token.

## Project Description & Architecture

This application bridges a React/Expo frontend with a local Ethereum blockchain powered by Hardhat. The system architecture is divided into two core smart contracts deployed on the Hardhat local network:

### Smart Contracts

* **`ALUAssetRegistry.sol`**: An immutable registry that stores metadata for official institutional assets (such as logos). It records the asset name, file extension, creator address, and a unique SHA-256 cryptographic hash (in `bytes32` format). It provides both state-changing registration functions and public, read-only integrity verification functions.

* **`ALULogoToken.sol`**: A custom ERC-20 token (**ALUT**) with a fixed total supply of 1,000,000 tokens minted to the contract deployer (initial owner). It includes governance features allowing the owner to distribute equity shares (`distributeShares`) and calculate wallet ownership percentages.

### Frontend-to-Contract Connection
The frontend communicates directly with the Ethereum blockchain via **Ethers.js (v6)** using React Context (`WalletContext.tsx`):
1. **Provider Setup**: The app hooks into `window.ethereum` (injected by the MetaMask browser extension) to establish a `Web3Provider` read/write connection.
2. **ABI & Address Binding**: The frontend imports the compiled contract Application Binary Interfaces (ABIs) from `src/contracts/` and binds them to the deployed smart contract addresses on `localhost:8545`.
3. **State Management**: When a user connects their wallet, the React Context instantiates read/write contract instances, allowing UI components (`TokenDashboard.tsx`, verification forms) to trigger smart contract functions and listen for on-chain state updates in real time.

---

## Registered ALU Logo SHA-256 Hash

During Formative 1 and integration testing, official institutional logo assets were hashed using the standard SHA-256 cryptographic algorithm. 

* **Sample Registered Hash (Formative 1 / Test Suite):**
  ```text
  0xf32dc05242d2bb034eefabdf8dd4afc60d7f50b8eae92c2e73156e945cedacb5 
* **Format:** 32-byte hexadecimal string (`bytes32`), prefixed with `0x` and containing exactly 64 hexadecimal characters.

* **Verification Usage:** When checking logo integrity on the public verification page, passing Token ID `1` alongside this exact hash string returns an authentic verification status from the smart contract.

## Technology Stack & Versions
This project was built and tested using the following environment specifications:
* **Runtime Environment:** Node.js (`v24.18.0` LTS)
* **Smart Contract Framework:** Hardhat (`v2.28.6`)
* **Smart Contract Language:** Solidity (`^0.8.20`)
* **Token Standard Library:** OpenZeppelin Contracts (`5.6.1`)
* **Frontend Framework:** React / Expo (`React 19.1.0` / `Expo SDK 54.0.25`)
* **Web3 Client Library:** Ethers.js (`v6.17.0`)
* **Testing Framework:** Hardhat Network (`Standard Hardhat Suite`)

## Installation & Setup Instructions
Follow these steps to set up the local blockchain, deploy the contracts, and start the frontend development server.

### Prerequisites
* Node.js installed on your system.

* MetaMask browser extension installed.

### Step 1: Clone & Install Backend Dependencies
Open your terminal in the root directory of the backend project:

### Install smart contract and Hardhat dependencies
* `npm install`

### Step 2: Start the Local Blockchain Node
In your terminal, spin up the local Hardhat network. Keep this terminal window running in the background:

* `npx hardhat node`

### Step 3: Deploy Smart Contracts
1. Open a second terminal window in the root directory and run the deployment script:

* `npx hardhat run scripts/deploy.js --network localhost`

2. Copy the newly deployed contract addresses printed in the terminal:


* ALUAssetRegistry Address (e.g., `0x5fbdb2315678afecb367f032d93f642f64180aa3`)

* ALULogoToken Address (e.g., `0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0`)

### Step 4: Configure & Start Frontend Server
1. Navigate to your frontend application folder (e.g., alu-logo-registry-dapp):

* `cd alu-logo-registry-dapp`
* `npm install`

2. Open src/context/wallet_context.tsx and update the contract address constants at the top of the file with your newly deployed addresses:

`const REGISTRY_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";`
`const TOKEN_ADDRESS = "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0";`

3. Start the development server for web:

* `npx expo start -w`

## Wallet Connection & Feature Guide
1. Connecting Your Wallet
Open MetaMask -> Network Selector -> Add Network -> Add Manually:

* **Network Name:** Hardhat Local

* **New RPC URL:** http://127.0.0.1:8545

* **Chain ID:** 31337

* **Currency Symbol:** ETH

2. Import a test account by copying the Private Key of Account #0 (Deployer/Admin) or Account #1 (Recipient) from your running Hardhat terminal into MetaMask.

3. On the dApp interface, click the Connect Wallet button and authorize the connection in MetaMask.

### Feature Usage Guide
Public Logo Verification (No Wallet Required):

* Anyone can verify asset authenticity without connecting a wallet or paying gas fees.

* Enter the registered Token ID (e.g., `1`) and the SHA-256 Hash string.

* Click Verify Integrity. The dApp queries the blockchain and returns either `[SUCCESS] Logo is authentic`or a warning if the hash has been tampered with.

### Asset Registration (Admin Feature):

* Connect using the deployer wallet (Account #0).

* Input the asset name (e.g., ALU Official Logo 2026), file type (PNG), and a valid 64-character hex SHA-256 hash.

* Click Register Asset and confirm the transaction in MetaMask. A unique Token ID will be assigned.

### Token Distribution Dashboard (Admin Only):

* Ownership Overview: Displays real-time metrics including Total ALUT Supply (1,000,000), your current wallet balance, and your calculated equity stake percentage.

* Distribute Shares: If connected as the contract owner, input a recipient's Ethereum address (0x...) and the raw amount of ALUT tokens to distribute (e.g., 5000).

* Click Distribute Tokens and confirm in MetaMask. Upon block confirmation, the recipient's balance and equity percentage update dynamically.

* **Note:** If connected as a non-owner wallet, distribution controls are locked and replaced with a security warning.




## Known Issues & Limitations
* **Local Network Nonce Desynchronization:**
If you restart the `npx hardhat node` terminal, the local blockchain resets to Block 0. However, MetaMask retains previous transaction history, causing a `BAD_DATA` or nonce mismatch error.

* **Fix:** In MetaMask, go to Settings -> Advanced -> Clear activity tab data to reset local transaction memory.

* **Solidity Integer Division Truncation:**
Solidity does not support floating-point decimals. Calculating percentages natively on-chain (e.g., `5,000 / 1,000,000`) rounds down to `0%`.

* **Workaround Implemented:** Raw balances and total supply are fetched via `ethers.formatUnits()`, and precise floating-point percentage math is calculated and formatted on the React frontend using `.toFixed(2)`.

* **ENS Resolution Errors on Local Networks:**
If an invalid address string or a string missing the 0x prefix is passed into Ethers.js v6 functions, the library attempts to resolve it as an Ethereum Name Service (.eth) domain. Since local Hardhat networks do not support ENS, this throws an `UNSUPPORTED_OPERATION (operation="getEnsAddress")` error. Always ensure recipient strings are valid 42-character hexadecimal addresses.

* **Zero Address Restrictions:**
In compliance with OpenZeppelin ERC-20 standards, tokens cannot be transferred or distributed to the zero address (`0x0000000000000000000000000000000000000000`). Attempting to do so will cause the smart contract transaction to revert.