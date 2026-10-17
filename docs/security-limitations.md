# Security Limitations

MindVault is a hackathon prototype, not production healthcare software. The limitations below are stated honestly and are relevant to any evaluation of the project.

- MindVault is a hackathon prototype, not production healthcare software.
- The application is not production-ready.
- It is not certified for healthcare regulatory compliance.
- Blockchain does not automatically make off-chain data private.
- The prototype uses fictional demo data only.
- Payment requests are simulated and labelled Demo Mode.
- The frontend assumes configured therapist and client wallet addresses for role detection.
- A production system requires encrypted off-chain storage, secure key management, verified therapist/client onboarding, recovery mechanisms, and independent security audits.

## Privacy Design

The smart contract stores only record hash/reference, consent status, expiry timestamp, session/access status, and audit events. It does not store therapy notes, diagnoses, client names, contact details, files, or raw medical data.

## Production Roadmap

- Encrypted off-chain record storage
- Client-controlled encryption keys
- Verified therapist credentials
- Gasless transactions through account abstraction or relayers
- Real payment settlement with explicit authorization
- Comprehensive compliance and security review
