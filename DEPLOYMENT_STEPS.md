# Exact Remix Deployment Steps for MindVault.sol

## 1. Prepare Remix Environment
- Open [remix.ethereum.org](https://remix.ethereum.org)
- Ensure you're on the "Solidity" tab in the left file explorer
- Delete any existing files in the workspace if desired

## 2. Create the Contract File
- Click the "+" icon to create a new file
- Name it: `contracts/MindVault.sol`
- Copy and paste the entire contract code from `contracts/MindVault.sol` into this file

## 3. Compile the Contract
- Click the "Solidity Compiler" tab in the left sidebar (icon: ⬡)
- Ensure compiler version is set to "0.8.20" or higher (use "Compiler 0.8.20+commit.xxx")
- Click "Compile MindVault.sol"
- Verify compilation succeeds (no red errors, green checkmark appears)

## 4. Deploy to a Test Network
- Click the "Deploy & Run Transactions" tab (icon: 📱)
- Under "ENVIRONMENT", select "Injected Provider - MetaMask" 
  - *Make sure MetaMask is installed and unlocked in your browser*
- MetaMask should prompt to connect - approve the connection
- Ensure you're connected to a test network (Sepolia, Goerli, or local testnet like Hardhat/localhost:8545)
- Under "ACCOUNT", select your therapist MetaMask account
- Under "CONTRACT", verify "MindVault" appears in the dropdown
- Click "Deploy"
- MetaMask will pop up requesting transaction confirmation - confirm it
- Wait for transaction to be mined

## 5. Verify Deployment
- After deployment succeeds, the contract instance will appear under "Deployed Contracts"
- Expand the contract instance to see all available functions
- The contract address will be displayed - copy this for your records