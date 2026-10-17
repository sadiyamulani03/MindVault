# MindVault — 2-Minute Live Demo Script

> **Presenter:** Sadiya Mulani  
> **Format:** Solo presentation with live browser demo  
> **Duration:** ~2 minutes  
> **Live URL:** https://mindvault-one-lemon.vercel.app/

---

## Pre-Demo Checklist

- [ ] Browser open to https://mindvault-one-lemon.vercel.app/#dashboard
- [ ] MetaMask installed (optional — Demo Mode works without it)
- [ ] Screen share active, browser zoomed to ~110%
- [ ] Dark mode set for visual contrast on projector

---

## Script

---

### [0:00 – 0:20] The Problem

> *"Therapy records are sensitive — but today they sit in fragmented, insecure systems. There's no transparent, auditable consent trail. Patients have no visibility into who accessed their records and when. MindVault changes that."*

**Action:** Show the Dashboard. Point to the stat cards.

> *"MindVault is a privacy-first workspace for solo therapists. It uses a smart contract on Polygon to create a tamper-proof, on-chain consent record — so every access is transparent, time-limited, and auditable."*

---

### [0:20 – 0:35] The Dashboard

> *"This is the therapist dashboard. You can see today's sessions, active clients, and live blockchain consent records."*

**Action:** Point to the sidebar. Click **Clients**. Show Jordan Demo's profile card.

> *"Jordan Demo is today's client. Their therapy record hash is stored on-chain as a reference — the actual notes remain encrypted off-chain."*

---

### [0:35 – 0:55] Request Access

**Action:** Click **Dashboard** in sidebar. Scroll to the **Demo Client Workflow** section.

> *"Step one: the therapist requests access to the client's encrypted record. This sends a transaction to the Polygon Amoy smart contract."*

**Action:** Click **🔓 Request Secure Access**.

- *If MetaMask is connected:* Approve the transaction in MetaMask.
- *If in Demo Mode:* The simulation proceeds automatically.

> *"The contract records: therapist address, client address, record hash, and a 60-minute access window."*

**Action:** Wait for the status pill to update to **"Access Requested — Awaiting Consent"**.

---

### [0:55 – 1:10] Client Approves Consent

> *"Step two: the client approves consent. In a real deployment, this would happen on the client's own device with their own wallet."*

**Action:** Click **🤝 Approve Consent (Client)** — confirm in the modal.

> *"The approval transaction is written to the blockchain. The consent is now active."*

**Action:** Show the **Consent Active** status pill and the **Access Expiry** countdown timer.

> *"The access is time-limited — 60 minutes. The smart contract enforces this automatically."*

---

### [1:10 – 1:25] Record Verified & Session Complete

**Action:** Click **🔍 Verify Access** — show the "Access Verified ✅" toast.

> *"The frontend queries the contract: is this access currently valid? The answer is yes."*

**Action:** Click **🏁 Complete Session**.

> *"The therapist marks the session complete. The smart contract closes the access window. The consent record is now sealed."*

**Action:** Show the status pill: **"Session Completed — Access Closed"**.

---

### [1:25 – 1:40] Payment & History

**Action:** Show the **Payment Request card** that appeared.

> *"A payment request appears — labelled Demo Mode. In a real system this would integrate with an invoicing layer."*

**Action:** Click **💳 Send Invoice (Demo)**.

**Action:** Scroll down to the **Access History** timeline.

> *"Every step is logged here — with real transaction hashes when on-chain, or simulated events in Demo Mode."*

**Action:** Show the **Blockchain Proof** panel — contract address, network, access status.

> *"And here is the cryptographic proof: the contract address on Polygon Amoy, the record ID, the access status — all verifiable on PolygonScan."*

---

### [1:40 – 2:00] Honest Disclaimer & Close

> *"One important note: this is a hackathon prototype. The consent audit trail is real and on-chain. But the therapy record contents in this demo are fictional. A production system would need encrypted off-chain storage, identity verification, and healthcare regulatory compliance — which are beyond the scope of today's demo."*

> *"MindVault demonstrates how blockchain-based consent management can give patients transparency and control over their most sensitive data. Thank you."*

---

## Backup: Demo Mode

If MetaMask is unavailable or the network is congested, the app automatically switches to **Demo Mode** and simulates the full workflow. All steps above work identically in Demo Mode. The only difference is that transaction hashes are not real.

---

## Key Talking Points

| Topic | One-liner |
|-------|-----------|
| Why blockchain? | Tamper-proof, auditable consent — not editable by any single party |
| Why Polygon Amoy? | Low-cost, EVM-compatible testnet — realistic gas costs |
| Privacy claim | Record *contents* never touch the chain — only the hash and consent metadata |
| Time-limited access | Contract enforces expiry — not just UI logic |
| Demo Mode | Full workflow demo without needing MetaMask or test MATIC |
