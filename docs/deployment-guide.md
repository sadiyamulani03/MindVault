# MindVault Deployment Guide

## Deployed Contract

- Network: Polygon Amoy Testnet
- Chain ID: 80002
- Contract Address: `0x5d721854efe4916607f3ea57a4d2afc603df046f`
- Explorer: https://amoy.polygonscan.com/address/0x5d721854efe4916607f3ea57a4d2afc603df046f

## Remix Deployment

1. Open https://remix.ethereum.org/
2. Create `contracts/MindVault.sol`
3. Paste the MindVault contract
4. Compile using Solidity 0.8.20+
5. Open **Deploy & Run**
6. Select **Injected Provider – MetaMask**
7. Connect MetaMask to Polygon Amoy
8. Deploy the contract
9. Copy the deployed contract address

## Frontend Setup

```bash
git clone https://github.com/sadiyamulani03/MindVault.git
cd MindVault/frontend
npx serve .
```

Open the local URL shown in the terminal.

## Vercel Deployment

1. Push the project to GitHub
2. Open https://vercel.com/new
3. Import `sadiyamulani03/MindVault`
4. Set **Root Directory** to `frontend`
5. Set **Framework Preset** to `Other`
6. Leave **Build Command** empty
7. Deploy

Live demo: https://mindvault-one-lemon.vercel.app/
