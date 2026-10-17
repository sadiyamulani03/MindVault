# MindVault — Security Limitations

> **Important:** This document is an honest disclosure of what MindVault is and is not.  
> Please read this before presenting, sharing, or extending this project.

---

## What MindVault Is

MindVault is a **hackathon prototype** built in ~2 hours to demonstrate the *concept* of blockchain-based consent management for therapy records.

It shows:
- How a smart contract can create a tamper-proof, auditable consent trail
- How a therapist can request time-limited access to a client's record hash
- How a client can approve or revoke consent on-chain
- How session lifecycle events can be permanently recorded

---

## What MindVault Is Not

### ❌ Not production-ready

This codebase has not been security-reviewed, load-tested, or hardened for production use. It should not be deployed for real patients or real therapists without significant additional engineering.

### ❌ Not healthcare-regulatory compliant

MindVault has not been assessed against:
- **HIPAA** (US Health Insurance Portability and Accountability Act)
- **GDPR** (EU General Data Protection Regulation)
- **DISHA** (India Digital Information Security in Healthcare Act — proposed)
- Any other national or regional healthcare data protection framework

Using this system with real patient data would likely violate applicable law.

### ❌ Blockchain does not automatically make data private

A common misconception: *"storing data on blockchain = private".*

The opposite is true. **Blockchain data is public by default.** Every transaction, address, and stored value on Polygon Amoy is visible to anyone.

What MindVault stores on-chain is:
- The therapist's wallet address
- The client's wallet address
- A record hash (`bytes32`)
- An expiry timestamp
- An access status

This is metadata — not record contents. But it is still linkable to real identities if wallet addresses are known. This is a significant privacy risk in a real deployment.

### ❌ No real off-chain encrypted storage

In this prototype, the record hash `0x1234...abcdef` is fictional. There is no actual therapy record. In a real system, you would need:

- **Encrypted off-chain storage** — e.g., IPFS with client-side encryption, or a HIPAA-compliant secure vault
- **Encryption key management** — so only the authorised therapist can decrypt the record
- **Access control** tied to the smart contract consent state

None of this is implemented here.

### ❌ No identity verification

Wallet addresses are pseudonymous. There is no mechanism to confirm that:
- The therapist wallet is held by a licensed therapist
- The client wallet is held by the actual patient
- The consent was given freely and with informed understanding

A real system would need identity verification and informed consent workflows.

### ❌ Hardcoded addresses

`THERAPIST_ADDRESS` and `CLIENT_ADDRESS` are hardcoded constants in `app.js`. This is intentional for the hackathon demo but means the frontend does not support multiple therapists or clients without code changes.

### ❌ No audit

This contract has not been audited by a professional smart contract security firm. It may contain vulnerabilities including but not limited to:

- Reentrancy risks
- Access control bypasses
- Integer overflow/underflow
- Gas limit issues on Amoy testnet

### ❌ Payments are simulated

All payment functionality in MindVault is a UI simulation. No real cryptocurrency or fiat currency is transferred at any point.

---

## What a Production Version Would Need

| Requirement | Description |
|-------------|-------------|
| Encrypted off-chain storage | IPFS + client-side AES encryption, or a HIPAA-compliant vault |
| Key management | Decentralised key sharing (e.g., Lit Protocol, Shamir secret sharing) |
| Identity verification | On-chain identity or verified credential layer (e.g., EAS, Polygon ID) |
| Smart contract audit | Independent security audit before mainnet deployment |
| HIPAA / GDPR compliance | Legal review, data processing agreements, breach notification procedures |
| Regulatory approval | Depending on jurisdiction, healthcare software may require regulatory clearance |
| Multi-tenancy | Support for multiple therapists and clients, role management |
| Incident response | Security monitoring, breach detection, key revocation |

---

## Responsible Disclosure

If you find a security vulnerability in this prototype, please contact the author via GitHub:  
https://github.com/sadiyamulani03/MindVault

---

## Summary

MindVault demonstrates a **real and viable concept**: using blockchain for healthcare consent audit trails. The architecture is sound at the conceptual level. However, the current implementation is a **proof of concept only** and must not be used with real patient data in its current state.
