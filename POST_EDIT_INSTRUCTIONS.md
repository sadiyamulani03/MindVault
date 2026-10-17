# Post-Edit Instructions for MindVault.sol

## ✅ Checklist to Recompile in Remix
1. **Open Remix** → https://remix.ethereum.org
2. **File Explorer** → Ensure `contracts/MindVault.sol` is present (copy-paste the updated content if needed).
3. **Solidity Compiler** tab:
   - Select compiler version `0.8.20` (or higher, e.g., `0.8.37`).
   - Click **Compile MindVault.sol**.
   - Confirm **no red errors**; a green check ✅ indicates success.
4. (Optional) **Compile Details** → Verify the ABI contains the functions/events (custom errors don’t appear in ABI but are in metadata).

## 🚀 Exact Remix Deployment Steps for Polygon Amoy using MetaMask
1. **Network Setup in MetaMask**:
   - Open MetaMask → **Networks** → **Add Network** manually:
     - Network Name: `Polygon Amoy Testnet`
     - New RPC URL: `https://rpc-amoy.polygon.technology`
     - Chain ID: `80002`
     - Currency Symbol: `MATIC`
     - Block Explorer URL: `https://www.oklink.com/amoy`
   - Switch MetaMask to **Polygon Amoy Testnet**.
   - Ensure you have testnet MATIC (obtain from a faucet, e.g., https://faucet.polygon.technology/).

2. **Remix Configuration**:
   - In Remix, go to the **Deploy & Run Transactions** tab (📱 icon).
   - **Environment**: `Injected Provider - MetaMask`.
   - MetaMask should prompt to connect; approve.
   - Confirm the connected account is funded with Amoy MATIC.
   - **Contract**: Ensure `MindVault` appears in the dropdown.
   - (Optional) **Gas Limit**: Leave as default or increase to 300,000 if needed.

3. **Deploy**:
   - Click **Deploy**.
   - MetaMask pops up; review transaction (should be contract creation).
   - Confirm and wait for tx to be mined (≈5-20 seconds on Amoy).
   - After success, the deployed contract instance appears under **Deployed Contracts**.

4. **Verify**:
   - Expand the contract instance; you should see all functions.
   - Copy the contract address for your records.

## ⚠️ Common Deployment Errors & Fixes
| Error Message | Likely Cause | Fix |
|---------------|--------------|-----|
| `insufficient funds for intrinsic transaction cost` | Account lacks MATIC for gas | Obtain more testnet MATIC from a faucet. |
| `invalid sender` or `account not found` | Wrong network or disconnected MetaMask | Ensure MetaMask is on **Polygon Amoy** and connected to Remix. |
| `nonce too high` / `nonce too low` | Stale nonce due to pending/tx re-send | Reset MetaMask nonce: Settings → Advanced → Reset Account (or use same nonce via CLI). |
| `VM Exception while processing transaction: revert` | Contract reverted (require/error) | Check input values: client != address(0), recordHash != 0, durationSeconds > 0. Also verify you’re not calling a restricted function from wrong account. |
| `transaction rejected` (generic) | Often out of gas or nonce issue | Increase gas limit manually; reset nonce; ensure sufficient MATIC. |
| `Proxy creation failed` (rare) | Compiler version mismatch | Use solidity ^0.8.20 exactly; avoid later experimental features. |
| `Invalid JSON RPC response: error code: -32603` | Node/RPC endpoint down | Switch RPC (e.g., use https://polygon-amoy.g.alchemy.com/v2/<key> or public RPC above). |
| `revert InvalidClient()` | Passed address(0) as client | Provide a valid client address (non-zero). |
| `revert InvalidRecordHash()` | Passed bytes32(0) | Provide a non-zero bytes32 value (e.g., keccak256("test")). |
| `revert InvalidDuration()` | Passed 0 for durationSeconds | Provide a positive integer (e.g., 3600 for 1 hour). |

**Tip**: If deployment keeps failing, try:
- Switching to “JavaScript VM” environment first to test the constructorless deploy (should work).
- Then switch back to Injected Provider and double-check network/funds.
- Use a fresh MetaMask account (newly funded) to avoid nonce issues.

---
**Reminder**: After deployment, test the functions using the provided TEST_PLAN.md (adjust steps for Amoy testnet). The contract is now ready for your hackathon demo.