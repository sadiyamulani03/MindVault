# 🧠 MindVault

Privacy-first workspace for solo therapists with client-controlled, time-limited access to therapy-record references.

[![Live Demo](https://img.shields.io/badge/Live_Demo-mindvault--one--lemon.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://mindvault-one-lemon.vercel.app/)
[![Polygon Amoy](https://img.shields.io/badge/Network-Polygon_Amoy-8247E5?style=for-the-badge&logo=polygon&logoColor=white)](https://amoy.polygonscan.com)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20%2B-363636?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

## Submission Links

| Item | Link |
|---|---|
| Live Demo | https://mindvault-one-lemon.vercel.app/ |
| Deployed Contract | https://amoy.polygonscan.com/address/0x5d721854efe4916607f3ea57a4d2afc603df046f |
| Contract Address | `0x5d721854efe4916607f3ea57a4d2afc603df046f` |
| Network | Polygon Amoy Testnet |
| Chain ID | 80002 |

> ⚠️ **Hackathon Prototype:** MindVault is not production healthcare software. No therapy notes, diagnoses, client names, contact details, or raw medical files are stored on-chain. The smart contract stores only record references/hashes, consent status, expiry, session status, and audit events. Payment requests are Demo Mode only.

## Problem

Solo therapists handle highly sensitive client records with fragmented tools and little enforceable control. Once a record reference is shared for a session, access is effectively permanent: nothing expires, nothing is revoked, and there is no trustworthy audit trail of who accessed what and when. Clients — the people the data belongs to — get no direct, verifiable say in how long a therapist can see a record. Heavyweight cloud suites are expensive, demand blind trust in a single provider, and are overkill for a solo practice.

## Solution

MindVault gives every therapy-record reference a **client-controlled, time-limited access lifecycle** enforced by an Ethereum-compatible smart contract:

- The **therapist requests access** to a record reference.
- The **client approves consent** — only the specified client wallet can do so.
- The contract records an **active, time-limited consent** window.
- The therapist **verifies record access**, runs the session, and marks it **completed**.
- Access is then **closed, revoked, or automatically expired**.
- Every important action is recorded as an **on-chain event**, producing an audit trail the client can verify independently.

No therapy notes, diagnoses, names, or raw medical files ever touch the chain — only record references/hashes, addresses, timestamps, and statuses.

## Core Workflow

```text
Therapist requests access
        ↓
Client approves consent
        ↓
Smart contract records active, time-limited consent
        ↓
Therapist verifies record access
        ↓
Therapist completes session
        ↓
Access is closed / revoked / expired
        ↓
Payment request appears in Demo Mode
        ↓
Access history and transaction proof are displayed
```

## Features

| Feature | Status | Description |
|---|---:|---|
| Wallet connection | ✅ Real | MetaMask connection on Polygon Amoy |
| Access request | ✅ Real | Therapist requests consent for a record reference |
| Client consent | ✅ Real | Only the specified client can approve |
| Time-limited access | ✅ Real | Access expires automatically |
| Record verification | ✅ Real | Contract validates approved and unexpired access |
| Session completion | ✅ Real | Only assigned therapist can complete an active session |
| Access revocation | ✅ Real | Client or therapist can revoke access |
| Access history | ✅ Real | Contract events create an auditable trail |
| Blockchain proof | ✅ Real | Contract address and transaction hashes displayed |
| Appointment dashboard | 🧪 Demo Mode | Fictional therapist scheduling data |
| Encrypted record view | 🧪 Demo Mode | Fictional encrypted-file representation |
| Payment request | 🧪 Demo Mode | UI-only workflow; no real settlement |

## Architecture

MindVault separates a minimal on-chain access-control layer from a dependency-free static frontend.

```text
MindVault/
├── contracts/
│   └── MindVault.sol        # Access-control smart contract (Solidity ^0.8.20)
├── frontend/
│   ├── index.html           # Single-page workspace UI
│   ├── style.css            # Styling
│   ├── app.js               # Wallet connection + contract interaction (ethers.js v6)
│   └── abi.json             # Contract ABI used by the frontend
├── README.md
└── test-checklist.md
```

| Layer | Responsibility |
|---|---|
| Smart contract | Single source of truth for consent state: requested → approved → completed / revoked / expired |
| Frontend | Static HTML/CSS/JS workspace; connects to MetaMask and reads/writes contract state via ethers.js v6 |
| Off-chain | Therapy records stay in existing client-controlled storage; only references/hashes are registered on-chain |
| Demo Mode | Appointment dashboard, encrypted record view, and payment request are simulated in the UI only |

## Smart Contract

| Item | Value |
|---|---|
| Network | Polygon Amoy Testnet (Chain ID 80002) |
| Contract Address | `0x5d721854efe4916607f3ea57a4d2afc603df046f` |
| Explorer | https://amoy.polygonscan.com/address/0x5d721854efe4916607f3ea57a4d2afc603df046f |
| Source | [`contracts/MindVault.sol`](contracts/MindVault.sol) |
| Compiler | Solidity `^0.8.20` |

Design principles:

- **Data minimization** — only wallet addresses, a `bytes32` record reference/hash, an expiry timestamp, a status enum, and an existence flag are stored.
- **Client-controlled consent** — `approveConsent` is callable only by the client address named in the request.
- **Time-limited by default** — access validity always checks `block.timestamp` against the recorded expiry.
- **Immutable and simple** — no admin keys or upgrade proxies; fewer trust assumptions and a smaller attack surface.
- **Explicit failures** — custom errors (`NotClient`, `AccessExpired`, `AccessNotFound`, …) make reverts self-explanatory.

## Smart Contract Functions

| Function | Access | Purpose |
|---|---|---|
| requestAccess() | Therapist | Creates a consent request for a client and record reference |
| approveConsent() | Client only | Approves time-limited access |
| revokeAccess() | Client or therapist | Revokes an active/requested access record |
| completeSession() | Therapist only | Closes access after an approved, unexpired session |
| isAccessValid() | Public view | Returns whether access is active and unexpired |
| getAccess() | Public view | Returns access metadata |

## Events

- `AccessRequested` — a therapist created a consent request for a record reference.
- `ConsentApproved` — the specified client approved time-limited access.
- `AccessRevoked` — the client or therapist revoked an access record.
- `SessionCompleted` — the assigned therapist completed an approved, unexpired session.

Together, these events form the auditable access history shown in the frontend and verifiable on the Polygon Amoy explorer.

## Run Locally

```bash
git clone https://github.com/sadiyamulani03/MindVault.git
cd MindVault/frontend
```

Open `index.html` using VS Code Live Server or:

```bash
npx serve frontend
```

Notes:

- No build step or package installation is required — the frontend is static.
- Connect MetaMask to **Polygon Amoy Testnet** (Chain ID `80002`) with a funded test account.
- The frontend talks to contract `0x5d721854efe4916607f3ea57a4d2afc603df046f` on Polygon Amoy.

## Vercel Deployment

1. Import the GitHub repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Other`.
4. Leave **Build Command** empty.
5. Deploy.

## Testing Checklist

See [test-checklist.md](test-checklist.md) for the full manual test plan using two MetaMask accounts (therapist and client).

- [ ] Wallet connects on Polygon Amoy (Chain ID 80002)
- [ ] Therapist can request access to a record reference
- [ ] Only the specified client can approve consent
- [ ] `isAccessValid` returns `true` for approved, unexpired access
- [ ] Access expires automatically once the timestamp passes
- [ ] Only the assigned therapist can complete an approved, unexpired session
- [ ] Client or therapist can revoke access
- [ ] Unauthorized callers revert (`NotClient`, `NotTherapist`, `NotAuthorized`)
- [ ] `AccessRequested`, `ConsentApproved`, `AccessRevoked`, `SessionCompleted` events appear in the access history
- [ ] Contract address and transaction hashes are displayed as blockchain proof
- [ ] Demo Mode items (appointments, encrypted record view, payment request) are clearly labeled simulations

## 📚 Documentation

- [Architecture](docs/architecture.md) — Roles, stack, on-chain vs off-chain, consent lifecycle, ASCII diagram
- [Demo Script](docs/demo-script.md) — 2-minute live demo script with speaker notes
- [Deployment Guide](docs/deployment-guide.md) — Remix, Polygon Amoy, Vercel, PolygonScan verification
- [Security Limitations](docs/security-limitations.md) — Honest prototype disclaimers
- [Test Plan](docs/test-plan.md) — 14 manual test cases

## Security Limitations

- Not production-ready.
- Not healthcare-regulatory compliant.
- Blockchain does not automatically make off-chain data private.
- Production requires encrypted off-chain storage, secure key management, verified identities, and security review.
- Payments are simulated.
- See [docs/security-limitations.md](docs/security-limitations.md) for full details.


## Future Roadmap

- Encrypted off-chain record storage
- Gasless transactions
- Verified therapist credentials
- Real payment settlement
- Calendar and reminder integrations

## 👩‍💻 Author

**Sadiya Mulani**  
Blockchain Technology Undergraduate  
- GitHub: https://github.com/sadiyamulani03

## 📚 Documentation

- [Architecture](docs/architecture.md)
- [Demo Script](docs/demo-script.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Security Limitations](docs/security-limitations.md)
- [Test Plan](docs/test-plan.md)

## License

MIT License.
