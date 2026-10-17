# MindVault — Architecture

> **Project by:** Sadiya Mulani  
> **Hackathon prototype** — not production-ready

---

## Overview

MindVault is a privacy-first workspace for solo therapists. It uses a smart contract on Polygon Amoy to record consent, access, and session lifecycle events on-chain — while keeping all actual therapy record contents encrypted and off-chain.

---

## User Roles

| Role | Description | On-chain capability |
|------|-------------|---------------------|
| **Therapist** | The deployer of the contract. Requests access to client records. | Call `requestAccess()`, `completeSession()` |
| **Client** | The patient. Approves or revokes consent for their record. | Call `approveConsent()`, `revokeAccess()` |
| **Admin** | Any connected wallet that is neither Therapist nor Client. | Read-only / observe |

Role detection is done client-side in `app.js` by comparing `msg.sender` to hardcoded `THERAPIST_ADDRESS` and `CLIENT_ADDRESS` constants.

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│                                                         │
│  index.html ──► style.css    (UI layout & dark mode)   │
│  app.js                      (wallet + contract logic)  │
│  abi.json                    (contract interface)       │
│                                                         │
│  ethers.js v6 (CDN)          (blockchain library)       │
│  MetaMask Extension          (wallet / signer)          │
└────────────────────────┬────────────────────────────────┘
                         │  JSON-RPC (eth_sendRawTransaction)
                         ▼
┌─────────────────────────────────────────────────────────┐
│               Polygon Amoy Testnet                       │
│               Chain ID: 80002                           │
│               RPC: rpc-amoy.polygon.technology          │
│                                                         │
│   ┌─────────────────────────────────────────────────┐  │
│   │  MindVault Smart Contract                        │  │
│   │  0x5d721854efe4916607f3ea57a4d2afc603df046f     │  │
│   │                                                  │  │
│   │  requestAccess(client, recordHash, duration)     │  │
│   │  approveConsent(recordId)                        │  │
│   │  completeSession(recordId)                       │  │
│   │  revokeAccess(recordId)                          │  │
│   │  isAccessValid(recordId) → bool                  │  │
│   │  getAccess(recordId) → AccessRecord              │  │
│   └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │  Off-chain (NOT in this prototype)
                         ▼
         ┌───────────────────────────────┐
         │  Encrypted Storage (future)   │
         │  e.g. IPFS + client-side      │
         │  encryption, or a HIPAA-      │
         │  compliant secure vault       │
         └───────────────────────────────┘
```

---

## Frontend Architecture

```
frontend/
├── index.html     Single-page application (6 sections, hash routing)
├── style.css      Design system: CSS variables, dark/light theme
├── app.js         Wallet connection, contract calls, demo mode
└── abi.json       Contract ABI — only the functions the frontend uses
```

### SPA Routing

Hash-based routing with no libraries or build step:

```
#dashboard      → Shows workflow, consent, proof panel
#appointments   → Schedule view
#clients        → Client profile + access status
#records        → Encrypted record reference + expiry
#payments       → Simulated invoice
#settings       → Theme, currency, wallet, network info
```

### Theme & Currency

- Theme (`light` / `dark` / `system`) stored in `localStorage['mindvault_theme']`
- Currency (`INR` / `USD` / `EUR` / `GBP` / `AED`) stored in `localStorage['mindvault_currency']`
- All amounts updated via `updateAllCurrencyDisplays()` without page reload

---

## Smart Contract Responsibilities

The contract records the **audit trail** of consent events. It does **not** store, process, or have access to any therapy record content.

### What the contract stores on-chain

| Data | Type | Purpose |
|------|------|---------|
| Therapist address | `address` | Who requested access |
| Client address | `address` | Who granted consent |
| Record hash (`bytes32`) | Hash of off-chain record | Tamper-proof reference |
| Access expiry timestamp | `uint64` | Time-limited access window |
| Access status | `enum` | Current lifecycle state |
| Existence flag | `bool` | Whether the record ID is valid |

### What stays off-chain (and must stay there)

- The actual therapy session notes
- Audio / video recordings
- Clinical assessments and diagnoses
- Patient identifiers beyond the demo wallet address
- Encryption keys

> ⚠️ In this prototype, no real off-chain encrypted storage is implemented. The record hash `0x1234...abcdef` is fictional.

---

## Consent Lifecycle

```
  ┌─────────────────────────────────────────────────────────────┐
  │                    Consent Lifecycle                         │
  └─────────────────────────────────────────────────────────────┘

  [Stage 0]  No Access
      │
      │  Therapist calls requestAccess(client, recordHash, duration)
      ▼
  [Stage 1]  Requested  ──── revokeAccess() ──────► [Stage 4] Revoked
      │
      │  Client calls approveConsent(recordId)
      ▼
  [Stage 2]  Active  ─────── revokeAccess() ──────► [Stage 4] Revoked
      │                  └── expiry reached ───────► [Expired — isAccessValid() = false]
      │
      │  Therapist calls completeSession(recordId)
      ▼
  [Stage 3]  Completed  (access closed, payment card appears in UI)
```

### Status enum mapping

| Value | Name | UI pill |
|-------|------|---------|
| 0 | NoAccess | Idle (grey) |
| 1 | Requested | Pending (amber) |
| 2 | Active | Active (green) |
| 3 | Completed | Completed (blue) |
| 4 | Revoked | Revoked (red) |

---

## Gas Configuration

Polygon Amoy enforces a minimum priority fee of **25 Gwei**. The frontend sets:

```js
const AMOY_GAS = {
  maxPriorityFeePerGas: 30_000_000_000n,  // 30 Gwei
  maxFeePerGas:         60_000_000_000n,  // 60 Gwei cap
};
```

---

## Demo Mode

When the user is not connected to MetaMask, or a contract call fails, the app automatically enters **Demo Mode**. All workflow steps are simulated locally with realistic delays and state transitions. No blockchain interaction occurs in Demo Mode.
