# MindVault — 2-Minute Demo Script

A practical, judge-friendly live demo script with speaker notes.

## Opening — 15 seconds

“MindVault is a privacy-first workspace for solo therapists. It reduces administrative work while giving clients control over access to sensitive therapy-record references. Private data stays off-chain; the smart contract manages verifiable consent and auditable access.”

## Therapist Dashboard — 20 seconds

“This is the therapist dashboard. It shows today’s appointments, available and booked slots, the client profile, and secure record-access controls.”

Show:

- Dashboard
- Demo Client profile
- Consent Request card
- Blockchain Proof Panel

## Request Access — 20 seconds

“The therapist requests access to an encrypted therapy-record reference. The contract stores only a hash, consent status, expiry, and audit events—not therapy notes or personal data.”

Action: Click **Request Access**.

## Client Consent — 25 seconds

“Now the client approves consent using their own wallet. Only the specified client can approve this request.”

Action: Switch to the client wallet and click **Approve Consent**.

Show:

- Consent Active
- Record Verified
- Transaction hash

## Complete Session — 25 seconds

“After the session, the therapist completes it. The smart contract closes access, so the record reference can no longer be accessed under this consent.”

Action: Switch back to the therapist wallet and click **Complete Session**.

Show:

- Session Completed
- Access invalid
- Payment Request card labelled **Demo Mode**

## Audit Trail — 15 seconds

“Every major action is recorded as an on-chain event. Users can view the access history and verify transactions on PolygonScan.”

Show:

- Access History
- Blockchain Proof Panel
- Contract address and transaction hash

## Closing — 10 seconds

“MindVault gives therapists a simple Web2-style experience while using Ethereum-compatible smart contracts for client-controlled, time-limited, and auditable record access.”

## Backup Plan

If Live Mode fails, switch to Demo Mode and say:

“Demo Mode demonstrates the complete user workflow. The contract is deployed on Polygon Amoy, and Demo Mode ensures the product flow remains visible even if testnet connectivity is unstable.”
