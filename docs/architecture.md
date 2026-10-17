# MindVault Architecture

MindVault is a privacy-first workspace for solo therapists. It enables client-controlled, time-limited access to therapy-record references. Private therapy content stays off-chain. The smart contract stores only record references/hashes, consent status, expiry, session status, and audit events.

## User Roles

| Role | Purpose |
|---|---|
| Therapist | Requests access, verifies records, completes sessions, manages appointments |
| Client | Approves or revokes consent for record access |
| Admin | Views network, contract, and system status |

## System Flow

```text
┌──────────────────────────┐
│   Therapist Dashboard    │
│  HTML / CSS / JavaScript │
└────────────┬─────────────┘
             │ ethers.js v6
             ▼
┌──────────────────────────┐
│      MetaMask Wallet     │
└────────────┬─────────────┘
             │ Polygon Amoy
             ▼
┌──────────────────────────┐
│     MindVault Contract   │
│ Consent + Access Control │
└────────────┬─────────────┘
             ▼
┌──────────────────────────┐
│ Encrypted off-chain data │
│  (production roadmap)    │
└──────────────────────────┘
```

## On-Chain Data

The smart contract stores only:

- Therapist address
- Client address
- `bytes32` record hash/reference
- Consent status
- Expiry timestamp
- Session/access status
- Audit events

The smart contract does **not** store therapy notes, diagnoses, client names, contact details, files, or raw medical data.

## Consent Lifecycle

```text
Requested → Approved → Completed
                ↓
             Revoked
                ↓
              Expired
```

- `requestAccess()` creates a consent request.
- `approveConsent()` allows only the specified client to approve.
- `completeSession()` allows only the assigned therapist to close an active session.
- `revokeAccess()` allows the client or therapist to revoke access.
- Access automatically becomes invalid after expiry.

## Technology Stack

- Frontend: HTML, CSS, JavaScript
- Web3: ethers.js v6 and MetaMask
- Blockchain: Polygon Amoy Testnet
- Smart contract: Solidity 0.8.20+
- Hosting: Vercel
