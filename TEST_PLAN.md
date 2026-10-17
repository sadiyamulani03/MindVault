# 10-Step Manual Test Plan (Two MetaMask Accounts: Therapist & Client)

## Setup
- **Therapist** account: account A, deploys contract, owns `requestAccess` / `completeSession`
- **Client** account: account B, owns `approveConsent` / `revokeAccess` (client-or-therapist can revoke)
- Connect MetaMask, ensure both accounts are funded on the same test network, switch between accounts in MetaMask

## Test Steps

| # | Action | MetaMask Account | Expected Result |
|---|--------|------------------|-----------------|
| 1 | Deploy `MindVault.sol` via Remix | Therapist | Contract deployed; `recordCount == 0` |
| 2 | Therapist calls `requestAccess(client=Client, recordHash=<32-byte hash>, durationSeconds=3600)` | Therapist | Returns `recordId == 1`; `AccessRequested` event emitted; `getAccess(1)` shows status `Requested`, therapist=A, client=B |
| 3 | Client calls `approveConsent(recordId=1)` | Client | Status changes to `Approved`; `ConsentApproved` event emitted |
| 4 | Client calls `approveConsent(recordId=1)` again | Client | Reverts `AccessNotRequested` |
| 5 | Therapist calls `isAccessValid(recordId=1)` | Therapist | Returns `true` |
| 6 | Therapist calls `completeSession(recordId=1)` | Therapist | Status changes to `Completed`; `SessionCompleted` event emitted |
| 7 | Therapist calls `completeSession(recordId=1)` again | Therapist | Reverts `AccessNotApproved` |
| 8 | Therapist calls `isAccessValid(recordId=1)` | Therapist | Returns `false` (completed) |
| 9 | Deploy a **second** record (repeat steps 2–3 to get `recordId=2`), then Client calls `revokeAccess(recordId=2)` | Client | Status changes to `Revoked`; `AccessRevoked` event emitted |
| 10 | Therapist calls `completeSession(recordId=2)` | Therapist | Reverts `AccessNotApproved`; `isAccessValid(2)` returns `false` |

## Negative / Edge-Case Checks
- Non-client calling `approveConsent` → reverts `NotClient`
- Non-therapist calling `completeSession` → reverts `NotTherapist`
- Random account calling `revokeAccess` on someone else's record → reverts `NotAuthorized`
- Non-existent `recordId` (e.g. 999) on any function → reverts `AccessNotFound`
- `getAccess` on non-existent record → all zeros / `false` / `Status.None`