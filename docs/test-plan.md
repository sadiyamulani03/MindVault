# MindVault Test Plan

Manual testing checklist covering the core on-chain workflow, failure cases, and Demo Mode fallback. Use two MetaMask accounts: therapist and client.

| Test Case | Expected Result |
|---|---|
| Therapist connects wallet | Therapist role is detected |
| Therapist requests access | `AccessRequested` event is emitted |
| Client approves consent | `ConsentApproved` event is emitted |
| Therapist verifies access | `isAccessValid` returns true |
| Therapist completes session | `SessionCompleted` event is emitted |
| Access after completion | `isAccessValid` returns false |
| Client revokes access | `AccessRevoked` event is emitted |
| Unauthorized client approval | Transaction reverts |
| Unauthorized session completion | Transaction reverts |
| Expired access | Access is invalid |
| Wallet not connected | Clear error or Demo Mode appears |
| Transaction failure | Clear failed transaction state appears |
| Browser refresh | Correct on-chain state is refreshed |
| Demo Mode fallback | Complete workflow works without pretending transactions are real |
