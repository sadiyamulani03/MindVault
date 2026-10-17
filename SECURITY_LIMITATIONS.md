# Honest Security Limitations for the Pitch

## 1. No On-Chain Encryption of References
- The `recordHash` (bytes32) is stored in plain view on-chain.
- While it is assumed to be a cryptographic hash of off-chain data, anyone can see which records a therapist requested.
- Mitigation: Therapists should use random, unpredictable identifiers (secrets) off-chain and only hash those; never hash patient names or predictable data.

## 2. Access Control Relies Solely on Ethereum Addresses
- Identity is tied to an externally-owned account (EOA) or contract address.
- If a therapist's or client's private key is compromised, an attacker can fully impersonate them.
- No multi-signature, role-based, or step-up authentication is available within the contract.

## 3. Fixed Lifetime per Request
- Once `requestAccess` is called, the expiry timestamp is set and cannot be extended without creating a new record.
- Long therapy sessions that exceed the initial duration require a new request/approval cycle.

## 4. Denial-of-Service via Griefing
- A malicious therapist can spam `requestAccess` for a client, filling storage and forcing the client to transact (approve or revoke) to clear each record.
- While each record costs gas, an attacker with sufficient funds could cause annoyance and increased gas costs for the client.

## 5. No Protection Against Replay of Signed Off-Chain Approvals
- The design requires on-chain transactions for consent (`approveConsent`) and completion (`completeSession`).
- If an off-chain signature scheme were later added, replay protection would need to be considered (not in-scope for v1).

## 6. Minimalist Design = No Upgradability
- The contract is intentionally immutable and simple.
- If a critical bug is found post-deployment, the only remedy is to deploy a new contract and migrate users.
- No proxy pattern or admin keys are included by design to reduce trust assumptions and attack surface.

## 7. Session Completion is Irreversible
- Once `completeSession` is called, the record status becomes `Completed` and cannot be reverted.
- This models the end of a therapy session but means accidental completion requires a new record for any follow-up.

## Summary
These limitations are acceptable for a hackathon prototype targeting privacy minimization and clear access controls. For production, consider adding off-chain encryption for hashes, multi-sig approval flows, and emergency freeze/pause mechanisms governed by a DAO or timelock.