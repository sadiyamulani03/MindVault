# MindVault — Deployment Guide

> **Project by:** Sadiya Mulani  
> **Hackathon prototype** — not production-ready

---

## 1. Contract Deployment (Remix IDE)

### Prerequisites

- MetaMask with Polygon Amoy network configured
- Some MATIC on Amoy for gas (free from faucet: https://faucet.polygon.technology/)
- Solidity source file for MindVault contract

### Add Polygon Amoy to MetaMask

| Field | Value |
|-------|-------|
| Network Name | Polygon Amoy Testnet |
| RPC URL | https://rpc-amoy.polygon.technology/ |
| Chain ID | 80002 |
| Currency Symbol | MATIC |
| Block Explorer | https://amoy.polygonscan.com |

### Remix Deployment Steps

1. Open [https://remix.ethereum.org](https://remix.ethereum.org)
2. Create a new file, paste the MindVault contract source
3. Compile using **Solidity 0.8.x** or higher (enable optimisation if desired)
4. Go to **Deploy & Run Transactions**
5. Set **Environment** to `Injected Provider - MetaMask`
6. Confirm MetaMask is on **Polygon Amoy (80002)**
7. Click **Deploy** → confirm in MetaMask
8. Copy the deployed contract address from the Remix console

> The deployed contract for this project:  
> `0x5d721854efe4916607f3ea57a4d2afc603df046f`

---

## 2. Frontend Configuration

### Update constants in `frontend/app.js`

```js
const CONTRACT_ADDRESS  = "0x5d721854efe4916607f3ea57a4d2afc603df046f"; // your contract
const THERAPIST_ADDRESS = "0xYourTherapistWalletAddress";               // deployer wallet
const CLIENT_ADDRESS    = "0xYourClientWalletAddress";                  // client wallet
```

### Update `frontend/abi.json`

Copy the ABI from Remix (Compilation Details → ABI) and replace `frontend/abi.json`.

---

## 3. Local Development

No npm, no build step. Just open the file directly or serve with any static file server.

### Option A — Direct file open

```
Open frontend/index.html in your browser
```

> Note: MetaMask requires `http://` not `file://`. Use Option B for wallet testing.

### Option B — Local static server

```bash
# Using Node.js serve (one-time install)
npx serve frontend --listen 5500

# Or using Python
python -m http.server 5500 --directory frontend
```

Then open: http://localhost:5500

---

## 4. Vercel Deployment

### Repository Structure

```
MindVault/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── abi.json
├── vercel.json          ← required
└── README.md
```

### vercel.json (project root)

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/frontend/$1"
    }
  ]
}
```

This routes all requests into the `frontend/` subdirectory without a build step.

### Vercel Dashboard Settings

| Setting | Value |
|---------|-------|
| Framework Preset | **Other** |
| Root Directory | *(leave empty — project root)* |
| Build Command | *(leave empty)* |
| Output Directory | *(leave empty)* |

### Deploy Steps

1. Push your repository to GitHub
2. Go to [https://vercel.com](https://vercel.com) → New Project
3. Import the GitHub repository
4. Apply the settings above
5. Click **Deploy**

Vercel auto-deploys on every push to `main`.

### Live URL for this project

```
https://mindvault-one-lemon.vercel.app/
```

---

## 5. Verify Contract on PolygonScan

Verifying the contract source makes the ABI publicly readable and builds trust.

1. Go to: https://amoy.polygonscan.com/address/0x5d721854efe4916607f3ea57a4d2afc603df046f
2. Click the **Contract** tab → **Verify and Publish**
3. Select:
   - Compiler Type: `Solidity (Single file)`
   - Compiler Version: match what you used in Remix
   - Licence: MIT (or your choice)
4. Paste the full contract source code
5. Click **Verify and Publish**

Once verified, the **Contract** tab shows a green checkmark ✅ and the source is publicly readable.

---

## 6. Getting Test MATIC

Polygon Amoy faucet:  
https://faucet.polygon.technology/

- Select **Polygon Amoy**
- Paste your wallet address
- Request test MATIC (usually 0.2–1 MATIC per request)
- Wait ~30 seconds for arrival

---

## 7. Environment Checklist

- [ ] Contract deployed on Polygon Amoy
- [ ] `CONTRACT_ADDRESS` updated in `app.js`
- [ ] `THERAPIST_ADDRESS` updated in `app.js`
- [ ] `CLIENT_ADDRESS` updated in `app.js`
- [ ] `abi.json` matches deployed contract
- [ ] `vercel.json` present in project root
- [ ] MetaMask connected to Polygon Amoy (Chain ID 80002)
- [ ] Wallet has test MATIC for gas
