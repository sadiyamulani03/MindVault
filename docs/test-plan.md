# MindVault — Test Plan

> **Type:** Manual functional test plan  
> **Environment:** https://mindvault-one-lemon.vercel.app/ (Polygon Amoy)  
> **Demo Mode:** Available without MetaMask for all workflow tests

---

## Test Environment Setup

| Item | Value |
|------|-------|
| Browser | Chrome or Brave (MetaMask supported) |
| Network | Polygon Amoy (Chain ID 80002) |
| Test MATIC | Required for live tests (from https://faucet.polygon.technology/) |
| MetaMask | Therapist wallet = deployer wallet |

---

## Test Cases

---

### TC-01: Request Access (Happy Path)

**Precondition:** Connected to MetaMask as therapist wallet. At Stage 0.

**Steps:**
1. Open Dashboard
2. Click **🔓 Request Secure Access**
3. Confirm transaction in MetaMask

**Expected:**
- MetaMask prompt appears with 30 Gwei priority fee
- Loading overlay shows "Transaction Sent"
- Status pill changes to **"Access Requested — Awaiting Consent"**
- Record ID is displayed
- Toast: "Access Requested!"
- History timeline shows "🔓 Secure Access Requested" with tx hash

**Pass criteria:** Stage advances to 1. Transaction visible on PolygonScan.

---

### TC-02: Approve Consent (Happy Path)

**Precondition:** Stage 1 (Access Requested). Connected as client wallet.

**Steps:**
1. Click **🤝 Approve Consent (Client)**
2. Review consent modal
3. Click **✅ Approve Consent** in modal
4. Confirm in MetaMask

**Expected:**
- Status pill: **"Consent Active — Record Accessible"**
- Access Expiry countdown starts (60 minutes)
- Consent Status card: "Approved ✅"
- Verify and Revoke buttons appear
- Toast: "Consent Active!"

**Pass criteria:** Stage advances to 2. `getAccess()` returns status = 2.

---

### TC-03: Verify Access

**Precondition:** Stage 2 (Consent Active).

**Steps:**
1. Click **🔍 Verify Access**

**Expected:**
- Toast: "Access Verified ✅ — The record access is valid and active on-chain."
- Record Verified card shows green pill

**Pass criteria:** `isAccessValid()` returns `true`. Green verification indicator.

---

### TC-04: Complete Session (Happy Path)

**Precondition:** Stage 2 (Consent Active). Connected as therapist wallet.

**Steps:**
1. Click **🏁 Complete Session**
2. Confirm in MetaMask

**Expected:**
- Status pill: **"Session Completed — Access Closed"**
- Payment Request card appears (labelled Demo Mode)
- History timeline: "🏁 Session Completed" with tx hash
- Verify and Revoke buttons hidden

**Pass criteria:** Stage advances to 3. `getAccess()` returns status = 3. Payment card visible.

---

### TC-05: Revoke Access

**Precondition:** Stage 1 or 2.

**Steps:**
1. Click **🚫 Revoke Access**
2. Confirm in MetaMask

**Expected:**
- Status pill: **"Access Revoked"**
- History: "🚫 Access Revoked" with tx hash
- Stage set to 4

**Pass criteria:** `getAccess()` returns status = 4.

---

### TC-06: Unauthorized Consent Approval

**Precondition:** Stage 1. Connected with a wallet that is **not** the client wallet.

**Steps:**
1. Click **🤝 Approve Consent (Client)**
2. Confirm in MetaMask

**Expected:**
- MetaMask gas estimation fails OR transaction reverts
- Toast shows: "Contract Error — Revert: NotClient" (or similar)
- App falls back to Demo Mode
- Stage does NOT advance

**Pass criteria:** Contract rejects the call. No state change on-chain.

---

### TC-07: Unauthorized Session Completion

**Precondition:** Stage 2. Connected with a wallet that is **not** the therapist wallet.

**Steps:**
1. Click **🏁 Complete Session**
2. Confirm in MetaMask

**Expected:**
- Contract rejects with `NotTherapist` revert
- Toast: "Contract Error — Revert: NotTherapist"
- Stage does NOT advance

**Pass criteria:** `completeSession()` reverts. No state change.

---

### TC-08: Expired Access

**Precondition:** Stage 2. Access expiry has passed (wait 60+ minutes, or use a contract with short duration).

**Steps:**
1. Click **🔍 Verify Access**

**Expected:**
- Toast: "Access Invalid — The record access is not currently valid."
- `isAccessValid()` returns `false`
- Expiry bar shows "Expired"

**Pass criteria:** Expired access is correctly identified.

---

### TC-09: Wallet Not Connected

**Precondition:** MetaMask not installed or not connected.

**Steps:**
1. Open the app
2. Click **🔓 Request Secure Access**

**Expected:**
- App detects no provider
- Automatically enters Demo Mode
- Demo Mode badge appears in header
- Workflow proceeds with simulated steps

**Pass criteria:** Demo Mode activates. No crash or broken UI.

---

### TC-10: Transaction Failure (Gas / Network)

**Precondition:** Connected to wrong network, or wallet has insufficient MATIC.

**Steps:**
1. Switch MetaMask to a different network (e.g., Ethereum mainnet)
2. Click **🔓 Request Secure Access**

**Expected:**
- Error toast with human-readable message (not raw hex)
- App falls back to Demo Mode gracefully

**Pass criteria:** Error is surfaced clearly. App does not crash.

---

### TC-11: Browser Refresh Retains Section

**Precondition:** Navigate to any section via sidebar.

**Steps:**
1. Navigate to `#payments`
2. Press F5 (refresh)

**Expected:**
- Page loads on the Payments section
- URL still shows `#payments`
- Sidebar highlights Payments

**Pass criteria:** Hash routing persists across refresh.

---

### TC-12: Demo Mode Full Workflow

**Precondition:** MetaMask not connected (Demo Mode active).

**Steps:**
1. Click **🔓 Request Secure Access** → demo stage 1
2. Click **🤝 Approve Consent** → confirm modal → demo stage 2
3. Click **🔍 Verify Access** → verified
4. Click **🏁 Complete Session** → demo stage 3
5. Click **💳 Send Invoice (Demo)**

**Expected:**
- Each stage transitions correctly
- History timeline populates with simulated events
- Payment card appears at stage 3
- Blockchain Proof panel shows "Demo" badge

**Pass criteria:** All 4 stages complete without errors. Demo badge always visible.

---

### TC-13: Settings Persistence

**Precondition:** Any state.

**Steps:**
1. Go to Settings → change Theme to **Dark**
2. Go to Settings → change Currency to **USD**
3. Refresh the page

**Expected:**
- Dark mode is still active after refresh
- Payment amounts show USD values (`$18`)
- Currency dropdown shows USD
- Theme segmented button shows Dark as active

**Pass criteria:** `localStorage['mindvault_theme']` = `'dark'`. `localStorage['mindvault_currency']` = `'USD'`.

---

### TC-14: Theme Toggle Button

**Precondition:** Any state.

**Steps:**
1. Click the 🌙 / ☀️ button in the top-right header

**Expected:**
- Theme toggles between dark and light
- Button icon changes to match current theme
- Toast confirms the change

**Pass criteria:** `data-theme` attribute on `<html>` changes. Colors update instantly.

---

## Test Results Template

| TC | Description | Pass / Fail | Notes |
|----|-------------|-------------|-------|
| TC-01 | Request access | | |
| TC-02 | Approve consent | | |
| TC-03 | Verify access | | |
| TC-04 | Complete session | | |
| TC-05 | Revoke access | | |
| TC-06 | Unauthorized consent | | |
| TC-07 | Unauthorized complete | | |
| TC-08 | Expired access | | |
| TC-09 | Wallet not connected | | |
| TC-10 | Transaction failure | | |
| TC-11 | Browser refresh | | |
| TC-12 | Demo Mode workflow | | |
| TC-13 | Settings persistence | | |
| TC-14 | Theme toggle | | |
