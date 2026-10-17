/* ============================================================
   MindVault — app.js
   Plain JavaScript + ethers.js v6 (CDN)
   ============================================================ */

"use strict";

// ============================================================
// CONSTANTS — edit these to match your deployment
// ============================================================

const CONTRACT_ADDRESS  = "0x5d721854efe4916607f3ea57a4d2afc603df046f";

// Full therapist wallet address used for contract deployment
const THERAPIST_ADDRESS = "0x81a4d4bfcdd0a9d819d4d404e9d734e".toLowerCase();
// NOTE: Replace the value above with your actual full therapist address
// e.g. "0x81a4d4bfcdd0a9d819d4d404e9d734e12345678"

const CLIENT_ADDRESS    = "0xc7156D6Da292D80d7Bc77A9da898FC0DC154b09f".toLowerCase();
// NOTE: Replace with your actual client wallet address before going live

const RECORD_HASH       = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
const ACCESS_DURATION   = 3600n; // uint64 — use BigInt so ethers.js v6 encodes it unambiguously

const CHAIN_ID          = 80002n; // Polygon Amoy
const CHAIN_ID_HEX      = "0x13882";
const RPC_URL           = "https://rpc-amoy.polygon.technology/";
const EXPLORER_URL      = "https://amoy.polygonscan.com";

const POLYGON_AMOY_PARAMS = {
  chainId: CHAIN_ID_HEX,
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: [RPC_URL],
  blockExplorerUrls: [`${EXPLORER_URL}/`],
};

// ============================================================
// APP STATE
// ============================================================
const state = {
  // Wallet
  provider: null,
  signer:   null,
  address:  null,
  role:     null,        // "therapist" | "client" | "admin"
  chainOk:  false,

  // Contract
  contract: null,
  abi:      null,

  // Demo / workflow
  demoMode:   false,
  recordId:   null,      // BigInt (live) or Number (demo)
  accessData: null,      // result of getAccess()

  // Workflow stage
  // 0 = idle, 1 = requested, 2 = consent approved, 3 = completed, 4 = revoked
  stage: 0,

  // History events
  history: [],

  // Expiry timer
  expiryTimer: null,
  expiryStart: null,
  expiryEnd:   null,

  // Demo stage counter
  demoRecordCounter: 1,
};

// ============================================================
// BOOT
// ============================================================
window.addEventListener("DOMContentLoaded", async () => {
  // Load ABI
  try {
    const res = await fetch("abi.json");
    state.abi = await res.json();
  } catch (e) {
    showToast("warning", "ABI Load Error", "Could not load abi.json. Entering Demo Mode.");
    enterDemoMode("ABI file could not be fetched.");
    return;
  }

  // Mobile sidebar toggle
  document.getElementById("menu-toggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });

  // If MetaMask already connected (persisted session), auto-connect
  if (window.ethereum && window.ethereum.selectedAddress) {
    connectWallet();
  }
});

// ============================================================
// WALLET CONNECTION
// ============================================================
async function connectWallet() {
  const btn = document.getElementById("btn-connect");

  if (!window.ethereum) {
    showToast("warning", "No Wallet Found", "MetaMask is not installed. Switching to Demo Mode.");
    enterDemoMode("MetaMask not installed.");
    return;
  }

  try {
    btn.textContent = "Connecting…";
    btn.disabled = true;

    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    await browserProvider.send("eth_requestAccounts", []);

    const network = await browserProvider.getNetwork();

    if (network.chainId !== CHAIN_ID) {
      // Try to switch network automatically
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CHAIN_ID_HEX }],
        });
      } catch (switchErr) {
        // Network not added — add it
        if (switchErr.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [POLYGON_AMOY_PARAMS],
            });
          } catch {
            showToast("error", "Wrong Network", "Please switch to Polygon Amoy manually, then reconnect.");
            enterDemoMode("Wrong network. Switch to Polygon Amoy.");
            btn.textContent = "🦊 Connect Wallet";
            btn.disabled = false;
            return;
          }
        } else {
          showToast("error", "Network Switch Failed", "Could not switch network. Entering Demo Mode.");
          enterDemoMode("Network switch rejected.");
          btn.textContent = "🦊 Connect Wallet";
          btn.disabled = false;
          return;
        }
      }
    }

    // Re-init provider after network switch
    state.provider = new ethers.BrowserProvider(window.ethereum);
    state.signer   = await state.provider.getSigner();
    state.address  = (await state.signer.getAddress()).toLowerCase();
    state.chainOk  = true;

    // Build contract instance
    state.contract = new ethers.Contract(CONTRACT_ADDRESS, state.abi, state.signer);

    // Assign role
    assignRole(state.address);

    // Update UI
    updateWalletUI();
    updateSidebarUser();
    showNetworkBadge();
    showToast("success", "Wallet Connected", `Address: ${shortAddr(state.address)}`);

    // Listen for account / chain changes
    window.ethereum.on("accountsChanged", (accs) => {
      if (accs.length === 0) { disconnectWallet(); }
      else { connectWallet(); }
    });
    window.ethereum.on("chainChanged", () => window.location.reload());

  } catch (err) {
    if (err.code === 4001) {
      showToast("warning", "Connection Rejected", "You rejected the wallet connection. Entering Demo Mode.");
      enterDemoMode("User rejected MetaMask connection.");
    } else {
      showToast("error", "Connection Failed", err.message.slice(0, 120));
      enterDemoMode("Wallet connection error.");
    }
    btn.textContent = "🦊 Connect Wallet";
    btn.disabled = false;
  }
}

function disconnectWallet() {
  state.provider = null;
  state.signer   = null;
  state.address  = null;
  state.contract = null;
  state.role     = null;
  document.getElementById("btn-connect").textContent = "🦊 Connect Wallet";
  document.getElementById("btn-connect").disabled = false;
  document.getElementById("wallet-display").textContent = "";
  document.getElementById("network-badge").classList.add("hidden");
  updateSidebarUser();
}

// ============================================================
// ROLE ASSIGNMENT
// ============================================================
function assignRole(addr) {
  if (addr === THERAPIST_ADDRESS) {
    state.role = "therapist";
  } else if (addr === CLIENT_ADDRESS) {
    state.role = "client";
  } else {
    state.role = "admin";
  }
}

function getRoleLabel() {
  const map = { therapist: "Therapist", client: "Client", admin: "Admin" };
  return map[state.role] || "Admin";
}

function getRoleEmoji() {
  const map = { therapist: "👨‍⚕️", client: "👤", admin: "🛡" };
  return map[state.role] || "🛡";
}

// ============================================================
// UI — WALLET + SIDEBAR
// ============================================================
function updateWalletUI() {
  const btn = document.getElementById("btn-connect");
  btn.textContent = `${getRoleEmoji()} ${shortAddr(state.address)}`;
  btn.disabled = false;
  document.getElementById("wallet-display").textContent = "";
}

function updateSidebarUser() {
  const avatar = document.getElementById("sidebar-avatar");
  const name   = document.getElementById("sidebar-name");
  const role   = document.getElementById("sidebar-role");

  if (state.address) {
    avatar.textContent = getRoleEmoji();
    name.textContent   = state.demoMode ? "Demo User" : shortAddr(state.address);
    role.textContent   = state.demoMode ? "Demo Mode" : getRoleLabel();
    role.style.background = state.demoMode ? "#fef3c7" : "";
    role.style.color      = state.demoMode ? "#92400e" : "";
  } else if (state.demoMode) {
    avatar.textContent = "🎭";
    name.textContent   = "Demo User";
    role.textContent   = "Demo Mode";
    role.style.background = "#fef3c7";
    role.style.color      = "#92400e";
  } else {
    avatar.textContent = "?";
    name.textContent   = "Not Connected";
    role.textContent   = "—";
  }
}

function showNetworkBadge() {
  document.getElementById("network-badge").classList.remove("hidden");
}

// ============================================================
// DEMO MODE
// ============================================================
function enterDemoMode(reason) {
  state.demoMode = true;
  state.role     = "therapist"; // demo always acts as therapist

  document.getElementById("demo-badge-header").classList.remove("hidden");
  document.getElementById("btn-connect").textContent = "🎭 Demo Mode";
  document.getElementById("btn-connect").disabled = true;

  updateSidebarUser();
  updateProofPanel();
  setProofModeBadge("demo");

  showToast("info", "Demo Mode Enabled", reason || "Simulating workflow locally. No blockchain transactions.");
}

// ============================================================
// PRIMARY ACTION (state machine)
// ============================================================
async function primaryAction() {
  switch (state.stage) {
    case 0: return await doRequestAccess();
    case 1: return showConsentModal();
    case 2: return await doCompleteSession();
    case 3:
    case 4: return resetWorkflow();
  }
}

// ============================================================
// CONTRACT ACTIONS
// ============================================================

// ── 1. Request Access ────────────────────────────────────────
async function doRequestAccess() {
  if (state.demoMode) { return demoRequestAccess(); }

  setLoading(true, "Requesting Secure Access", "Awaiting MetaMask confirmation…");
  try {
    // ethers.getAddress() applies EIP-55 checksum — avoids InvalidClient revert
    const clientChecksummed = ethers.getAddress(CLIENT_ADDRESS);
    const tx = await state.contract.requestAccess(
      clientChecksummed,
      RECORD_HASH,
      ACCESS_DURATION
    );
    setLoading(true, "Transaction Sent", "Waiting for blockchain confirmation…");
    showToast("info", "Transaction Pending", `Tx: ${shortAddr(tx.hash)}`);

    const receipt = await tx.wait();

    // Parse AccessRequested event to get recordId
    let recordId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = state.contract.interface.parseLog(log);
        if (parsed && parsed.name === "AccessRequested") {
          recordId = parsed.args[0]; // recordId
          break;
        }
      } catch { /* ignore */ }
    }

    // Fallback: if event parsing fails, try return value approach
    if (recordId === null) {
      // Some contracts emit via return; try reading the last record ID
      recordId = BigInt(state.demoRecordCounter);
    }

    state.recordId = recordId;
    state.stage    = 1;

    addHistory("🔓 Secure Access Requested", tx.hash);
    setLatestTx(tx.hash);
    setLoading(false);
    showToast("success", "Access Requested!", `Record ID: ${recordId.toString()}`);
    await refreshAccessData();
    updateWorkflowUI();

  } catch (err) {
    setLoading(false);
    handleContractError(err, "requestAccess");
  }
}

// ── 2. Approve Consent ────────────────────────────────────────
async function approveConsent() {
  closeConsentModal();
  if (state.demoMode) { return demoApproveConsent(); }
  if (state.recordId === null) {
    showToast("error", "No Record", "Request access first.");
    return;
  }

  setLoading(true, "Approving Consent", "Client is approving on the blockchain…");
  try {
    const tx = await state.contract.approveConsent(state.recordId);
    setLoading(true, "Transaction Sent", "Waiting for confirmation…");
    showToast("info", "Transaction Pending", `Tx: ${shortAddr(tx.hash)}`);

    await tx.wait();

    state.stage = 2;
    addHistory("✅ Consent Approved", tx.hash);
    setLatestTx(tx.hash);
    setLoading(false);
    showToast("success", "Consent Active!", "The client has approved record access.");
    await refreshAccessData();
    updateWorkflowUI();
    updateConsentUI();

  } catch (err) {
    setLoading(false);
    handleContractError(err, "approveConsent");
  }
}

// ── 2b. Confirm Approve (modal confirm button) ───────────────
async function confirmApproveConsent() {
  await approveConsent();
}

// ── 3. Complete Session ───────────────────────────────────────
async function doCompleteSession() {
  if (state.demoMode) { return demoCompleteSession(); }
  if (state.recordId === null) {
    showToast("error", "No Record", "No active record to complete.");
    return;
  }

  setLoading(true, "Completing Session", "Recording session completion on-chain…");
  try {
    const tx = await state.contract.completeSession(state.recordId);
    setLoading(true, "Transaction Sent", "Waiting for confirmation…");
    showToast("info", "Transaction Pending", `Tx: ${shortAddr(tx.hash)}`);

    await tx.wait();

    state.stage = 3;
    addHistory("🏁 Session Completed", tx.hash);
    setLatestTx(tx.hash);
    setLoading(false);
    showToast("success", "Session Complete!", "Access has been revoked and session logged.");
    await refreshAccessData();
    updateWorkflowUI();
    showPaymentCard();

  } catch (err) {
    setLoading(false);
    handleContractError(err, "completeSession");
  }
}

// ── Revoke Access ─────────────────────────────────────────────
async function revokeAccess() {
  if (state.demoMode) { return demoRevokeAccess(); }
  if (state.recordId === null) {
    showToast("error", "No Record", "No active record to revoke.");
    return;
  }

  setLoading(true, "Revoking Access", "Sending revoke transaction…");
  try {
    const tx = await state.contract.revokeAccess(state.recordId);
    showToast("info", "Transaction Pending", `Tx: ${shortAddr(tx.hash)}`);
    await tx.wait();

    state.stage = 4;
    addHistory("🚫 Access Revoked", tx.hash);
    setLatestTx(tx.hash);
    setLoading(false);
    showToast("success", "Access Revoked", "The record access has been revoked on-chain.");
    await refreshAccessData();
    updateWorkflowUI();

  } catch (err) {
    setLoading(false);
    handleContractError(err, "revokeAccess");
  }
}

// ── Verify Access ─────────────────────────────────────────────
async function verifyAccess() {
  if (state.demoMode) { return demoVerifyAccess(); }
  if (state.recordId === null) {
    showToast("error", "No Record", "No record to verify.");
    return;
  }

  setLoading(true, "Verifying Access", "Querying the blockchain…");
  try {
    const isValid = await state.contract.isAccessValid(state.recordId);
    setLoading(false);
    if (isValid) {
      showToast("success", "Access Verified ✅", "The record access is valid and active on-chain.");
      updateVerificationUI(true);
    } else {
      showToast("warning", "Access Invalid", "The record access is not currently valid.");
      updateVerificationUI(false);
    }
  } catch (err) {
    setLoading(false);
    handleContractError(err, "isAccessValid");
  }
}

// ── Request Payment (demo UI only) ───────────────────────────
function requestPayment() {
  addHistory("💳 Payment Requested", null);
  showToast("success", "Invoice Sent (Demo)", "This is a simulated payment request in Demo Mode.");
}

// ── Refresh access data after any tx ─────────────────────────
async function refreshAccessData() {
  if (!state.contract || state.recordId === null) return;
  try {
    const data    = await state.contract.getAccess(state.recordId);
    const isValid = await state.contract.isAccessValid(state.recordId);
    state.accessData = { data, isValid };
    updateExpiryUI(data, isValid);
    updateVerificationUI(isValid);
    updateProofPanel(data, isValid);
  } catch (e) {
    console.warn("refreshAccessData failed:", e);
  }
}

// ============================================================
// DEMO MODE SIMULATIONS
// ============================================================
function demoRequestAccess() {
  state.stage    = 1;
  state.recordId = state.demoRecordCounter++;
  const fakeTime = Date.now() + ACCESS_DURATION * 1000;
  state.expiryStart = Date.now();
  state.expiryEnd   = fakeTime;

  addHistory("🔓 Secure Access Requested", null, true);
  startExpiryTimer();
  updateWorkflowUI();
  showToast("success", "Access Requested (Demo)", `Simulated Record ID: #${state.recordId}`);
  updateProofPanel();
}

function demoApproveConsent() {
  closeConsentModal();
  state.stage = 2;
  addHistory("✅ Consent Approved", null, true);
  updateWorkflowUI();
  updateConsentUI();
  updateVerificationUI(true);
  showToast("success", "Consent Active (Demo)", "Simulated consent recorded locally.");
  updateProofPanel();
}

function demoCompleteSession() {
  state.stage = 3;
  addHistory("🏁 Session Completed", null, true);
  clearExpiryTimer();
  updateWorkflowUI();
  showPaymentCard();
  updateVerificationUI(false);
  showToast("success", "Session Complete (Demo)", "Access revoked, session logged locally.");
  updateProofPanel();
}

function demoRevokeAccess() {
  state.stage = 4;
  addHistory("🚫 Access Revoked", null, true);
  clearExpiryTimer();
  updateWorkflowUI();
  showToast("success", "Access Revoked (Demo)", "Simulated revocation recorded locally.");
  updateProofPanel();
}

function demoVerifyAccess() {
  const isValid = (state.stage === 2);
  updateVerificationUI(isValid);
  showToast(
    isValid ? "success" : "warning",
    isValid ? "Access Valid ✅ (Demo)" : "Access Invalid (Demo)",
    "Simulated verification result."
  );
}

// ============================================================
// WORKFLOW UI STATE MACHINE
// ============================================================
const STAGE_CONFIG = {
  0: {
    pillClass:     "pill-idle",
    pillText:      "No Access Requested",
    btnClass:      "btn-primary",
    btnText:       "🔓 Request Secure Access",
    badgeText:     "Stage 1 of 4",
    showRevoke:    false,
    showVerify:    false,
    showConsent:   false,
  },
  1: {
    pillClass:     "pill-pending",
    pillText:      "Access Requested — Awaiting Consent",
    btnClass:      "btn-teal",
    btnText:       "🤝 Approve Consent",
    badgeText:     "Stage 2 of 4",
    showRevoke:    true,
    showVerify:    false,
    showConsent:   true,
  },
  2: {
    pillClass:     "pill-active",
    pillText:      "Consent Active — Record Accessible",
    btnClass:      "btn-success",
    btnText:       "🏁 Complete Session",
    badgeText:     "Stage 3 of 4",
    showRevoke:    true,
    showVerify:    true,
    showConsent:   false,
  },
  3: {
    pillClass:     "pill-completed",
    pillText:      "Session Completed — Access Closed",
    btnClass:      "btn-warn",
    btnText:       "🔄 Start New Session",
    badgeText:     "Stage 4 of 4 ✓",
    showRevoke:    false,
    showVerify:    false,
    showConsent:   false,
  },
  4: {
    pillClass:     "pill-revoked",
    pillText:      "Access Revoked",
    btnClass:      "btn-warn",
    btnText:       "🔄 Start New Session",
    badgeText:     "Access Revoked",
    showRevoke:    false,
    showVerify:    false,
    showConsent:   false,
  },
};

function updateWorkflowUI() {
  const cfg = STAGE_CONFIG[state.stage];

  // Status pill
  const pill = document.getElementById("access-status-pill");
  pill.className = `status-pill ${cfg.pillClass}`;
  pill.innerHTML = `<span class="dot"></span> ${cfg.pillText}`;

  // Primary button
  const btn = document.getElementById("btn-primary-action");
  btn.className = `btn ${cfg.btnClass} btn-full`;
  btn.textContent = cfg.btnText;

  // Workflow badge
  document.getElementById("workflow-stage-badge").textContent = cfg.badgeText;

  // Secondary buttons
  const revokeBtn  = document.getElementById("btn-revoke");
  const verifyBtn  = document.getElementById("btn-verify");
  const consentBtn = document.getElementById("btn-approve-consent");

  cfg.showRevoke  ? revokeBtn.classList.remove("hidden")  : revokeBtn.classList.add("hidden");
  cfg.showVerify  ? verifyBtn.classList.remove("hidden")  : verifyBtn.classList.add("hidden");
  cfg.showConsent ? consentBtn.classList.remove("hidden") : consentBtn.classList.add("hidden");

  // Record ID display
  const ridDisplay = document.getElementById("record-id-display");
  if (state.recordId !== null && state.stage > 0) {
    ridDisplay.classList.remove("hidden");
    document.getElementById("record-id-value").textContent = `#${state.recordId.toString()}`;
  } else {
    ridDisplay.classList.add("hidden");
  }

  // Client tag
  const tagMap = {
    0: ["Awaiting Consent", "purple"],
    1: ["Pending Approval", "warn"],
    2: ["Consent Active", "teal"],
    3: ["Session Closed", "green"],
    4: ["Access Revoked", "warn"],
  };
  const [tagText, tagStyle] = tagMap[state.stage];
  const clientTag = document.getElementById("client-role-tag");
  clientTag.textContent = tagText;
  clientTag.className   = `tag ${tagStyle}`;

  // Stat counter
  document.getElementById("stat-consents").textContent = state.stage === 2 ? "1" : "0";

  // Proof panel
  updateProofPanel();
}

// ============================================================
// CONSENT UI
// ============================================================
function updateConsentUI() {
  const pill = document.getElementById("consent-pill");
  const text = document.getElementById("consent-text");
  if (state.stage >= 2) {
    pill.className = "status-pill pill-active";
    pill.innerHTML = '<span class="dot"></span> Consent Active';
    text.textContent = "Client has approved access. Consent is recorded on-chain.";
  } else if (state.stage === 1) {
    pill.className = "status-pill pill-pending";
    pill.innerHTML = '<span class="dot"></span> Awaiting Client Approval';
    text.textContent = "Waiting for the client to approve consent.";
  } else if (state.stage >= 3) {
    pill.className = "status-pill pill-revoked";
    pill.innerHTML = '<span class="dot"></span> Consent Closed';
    text.textContent = "Session is complete. Consent has been closed.";
  }
}

// ============================================================
// VERIFICATION UI
// ============================================================
function updateVerificationUI(isValid) {
  const pill = document.getElementById("verify-pill");
  const text = document.getElementById("verify-text");
  if (isValid) {
    pill.className = "status-pill pill-success";
    pill.innerHTML = '<span class="dot"></span> ✅ Record Verified';
    text.textContent = "The encrypted record hash has been verified on-chain.";
  } else if (state.stage === 0) {
    pill.className = "status-pill pill-idle";
    pill.innerHTML = '<span class="dot"></span> Not Verified';
    text.textContent = "Request access first to verify the client's record on-chain.";
  } else {
    pill.className = "status-pill pill-revoked";
    pill.innerHTML = '<span class="dot"></span> Access Not Active';
    text.textContent = "Record access has expired or been revoked.";
  }
}

// ============================================================
// EXPIRY UI
// ============================================================
function startExpiryTimer() {
  clearExpiryTimer();
  if (!state.expiryEnd) return;

  const total = state.expiryEnd - state.expiryStart;

  function tick() {
    const now       = Date.now();
    const remaining = state.expiryEnd - now;
    if (remaining <= 0) {
      document.getElementById("expiry-time").textContent = "Expired";
      document.getElementById("expiry-fill").style.width = "0%";
      document.getElementById("expiry-text").textContent = "Session access has expired.";
      clearExpiryTimer();
      return;
    }
    const pct = (remaining / total) * 100;
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    document.getElementById("expiry-time").textContent =
      `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
    document.getElementById("expiry-fill").style.width = `${pct}%`;
    document.getElementById("expiry-text").textContent =
      `Active until ${new Date(state.expiryEnd).toLocaleTimeString()}`;
    document.getElementById("proof-expiry").textContent =
      new Date(state.expiryEnd).toLocaleTimeString();
  }

  tick();
  state.expiryTimer = setInterval(tick, 1000);
}

function clearExpiryTimer() {
  if (state.expiryTimer) {
    clearInterval(state.expiryTimer);
    state.expiryTimer = null;
  }
  document.getElementById("expiry-time").textContent = "—";
  document.getElementById("expiry-fill").style.width = "0%";
  document.getElementById("expiry-text").textContent = "No active session access.";
}

function updateExpiryUI(data, isValid) {
  if (!isValid || !data) return;
  const expiry = Number(data[3]); // expiry in seconds (getAccess: therapist, client, recordHash, expiry, status, exists)
  state.expiryStart = Date.now();
  state.expiryEnd   = expiry * 1000;
  if (state.expiryEnd > Date.now()) {
    startExpiryTimer();
  } else {
    clearExpiryTimer();
    document.getElementById("expiry-time").textContent = "Expired";
  }
}

// ============================================================
// BLOCKCHAIN PROOF PANEL
// ============================================================
function updateProofPanel(data, isValid) {
  const statusEl = document.getElementById("proof-access-status");
  const ridEl    = document.getElementById("proof-record-id");

  ridEl.textContent = state.recordId !== null ? `#${state.recordId.toString()}` : "—";

  const statusMap = {
    0: { text: "No Access", cls: "warn" },
    1: { text: "Requested", cls: "warn" },
    2: { text: "Active ✅",  cls: "green" },
    3: { text: "Completed",  cls: "highlight" },
    4: { text: "Revoked ❌", cls: "red" },
  };
  const s = statusMap[state.stage] || statusMap[0];
  statusEl.className   = `proof-value ${s.cls}`;
  statusEl.textContent = s.text;

  // Contract address (shortened but linkable)
  const contractEl = document.getElementById("proof-contract");
  contractEl.innerHTML = `<a class="proof-link" href="${EXPLORER_URL}/address/${CONTRACT_ADDRESS}" target="_blank">${shortAddr(CONTRACT_ADDRESS, 6)}</a>`;

  if (state.demoMode) {
    setProofModeBadge("demo");
  } else if (state.chainOk) {
    setProofModeBadge("live");
  }
}

function setProofModeBadge(mode) {
  const badge = document.getElementById("proof-mode-badge");
  if (mode === "live") {
    badge.className = "tag teal";
    badge.textContent = "🟢 Live";
  } else if (mode === "demo") {
    badge.className = "tag warn";
    badge.textContent = "🎭 Demo";
  } else {
    badge.className = "tag warn";
    badge.textContent = "Disconnected";
  }
}

function setLatestTx(hash) {
  const el = document.getElementById("proof-tx-hash");
  el.innerHTML = `<a class="proof-link" href="${EXPLORER_URL}/tx/${hash}" target="_blank">${hash}</a>`;
}

// ============================================================
// ACCESS HISTORY TIMELINE
// ============================================================
function addHistory(eventText, txHash, isDemo) {
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  state.history.unshift({ eventText, txHash, isDemo, timestamp });
  renderTimeline();
}

function renderTimeline() {
  const container = document.getElementById("access-timeline");
  const empty     = document.getElementById("timeline-empty");

  if (state.history.length === 0) {
    empty.style.display = "";
    return;
  }
  empty.style.display = "none";

  // Re-render all items (simple, fast enough for demo)
  const items = container.querySelectorAll(".timeline-item");
  items.forEach(i => i.remove());

  state.history.forEach(entry => {
    const dotClass = getDotClass(entry.eventText);
    const hashHtml = entry.txHash
      ? `<a class="timeline-hash" href="${EXPLORER_URL}/tx/${entry.txHash}" target="_blank">🔗 ${entry.txHash}</a>`
      : (entry.isDemo
          ? `<span class="timeline-hash" style="color:var(--clr-warn)">🎭 Simulated Event — no blockchain transaction</span>`
          : "");

    const div = document.createElement("div");
    div.className = "timeline-item";
    div.innerHTML = `
      <div class="timeline-dot ${dotClass}">${getEventEmoji(entry.eventText)}</div>
      <div class="timeline-body">
        <div class="timeline-event">${entry.eventText}</div>
        <div class="timeline-time">${entry.timestamp}</div>
        ${hashHtml}
      </div>`;
    container.appendChild(div);
  });
}

function getDotClass(text) {
  if (text.includes("Requested")) return "req";
  if (text.includes("Consent"))   return "con";
  if (text.includes("Completed")) return "comp";
  if (text.includes("Revoked"))   return "rev";
  if (text.includes("Payment"))   return "pay";
  return "req";
}

function getEventEmoji(text) {
  if (text.includes("Requested")) return "🔓";
  if (text.includes("Consent"))   return "✅";
  if (text.includes("Completed")) return "🏁";
  if (text.includes("Revoked"))   return "🚫";
  if (text.includes("Payment"))   return "💳";
  return "📋";
}

function clearHistory() {
  state.history = [];
  renderTimeline();
}

// ============================================================
// PAYMENT CARD
// ============================================================
function showPaymentCard() {
  document.getElementById("payment-card").classList.add("visible");
}

// ============================================================
// RESET WORKFLOW
// ============================================================
function resetWorkflow() {
  state.stage      = 0;
  state.recordId   = null;
  state.accessData = null;
  clearExpiryTimer();
  document.getElementById("payment-card").classList.remove("visible");
  updateWorkflowUI();
  updateConsentUI();
  updateVerificationUI(false);
  updateProofPanel();
  showToast("info", "Workflow Reset", "Ready to start a new session.");
}

// ============================================================
// CONSENT MODAL
// ============================================================
function showConsentModal() {
  document.getElementById("modal-therapist").textContent =
    state.address ? shortAddr(state.address) : "Demo Therapist";
  document.getElementById("modal-record-id").textContent =
    state.recordId !== null ? `#${state.recordId.toString()}` : "Pending";
  document.getElementById("consent-modal").classList.add("active");
}

function closeConsentModal() {
  document.getElementById("consent-modal").classList.remove("active");
}

// ============================================================
// ERROR HANDLING
// ============================================================
function handleContractError(err, fnName) {
  console.error(`[${fnName}]`, err);

  // User rejected the tx in MetaMask
  if (err.code === 4001 || err.code === "ACTION_REJECTED") {
    showToast("warning", "Transaction Rejected", "You rejected the transaction in MetaMask.");
    return;
  }

  // Decode ethers.js v6 custom Solidity errors (err.revert) or raw reason string
  let msg = "Unknown error";
  if (err.revert && err.revert.name) {
    // Custom error decoded by ethers v6
    msg = `Revert: ${err.revert.name}`;
    if (err.revert.args && err.revert.args.length > 0) {
      msg += ` (${err.revert.args.join(", ")})`;
    }
  } else if (err.reason) {
    msg = err.reason;
  } else if (err.shortMessage) {
    // ethers v6 shortMessage is human-readable
    msg = err.shortMessage;
  } else if (err.message) {
    // Strip the raw JSON from MetaMask error messages for readability
    msg = err.message.replace(/\s*\(action=.*\)/s, "").slice(0, 160);
  }

  // Also try to decode from raw data if available
  if (msg === "Unknown error" && err.data && state.contract) {
    try {
      const decoded = state.contract.interface.parseError(err.data);
      if (decoded) msg = `Revert: ${decoded.name}`;
    } catch { /* not a known custom error */ }
  }

  showToast("error", `Contract Error — ${fnName}`, msg.slice(0, 180));

  if (!state.demoMode) {
    showToast("info", "Switching to Demo Mode", "Continuing with simulated workflow.");
    enterDemoMode(`Contract call failed: ${fnName}`);
    // Continue the workflow step in demo
    switch (state.stage) {
      case 0: demoRequestAccess();  break;
      case 1: demoApproveConsent(); break;
      case 2: demoCompleteSession();break;
    }
  }
}

// ============================================================
// LOADING OVERLAY
// ============================================================
function setLoading(show, title, sub) {
  const overlay = document.getElementById("loading-overlay");
  if (show) {
    document.getElementById("loading-title").textContent = title || "Processing…";
    document.getElementById("loading-sub").textContent   = sub   || "Please wait…";
    overlay.classList.add("active");
  } else {
    overlay.classList.remove("active");
  }
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(type, title, message) {
  const container = document.getElementById("toast-container");
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || "ℹ️"}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message || ""}</div>
    </div>`;
  container.appendChild(toast);

  const duration = type === "error" ? 6000 : 4000;
  setTimeout(() => {
    toast.classList.add("toast-out");
    toast.addEventListener("animationend", () => toast.remove());
  }, duration);
}

// ============================================================
// UTILITIES
// ============================================================
function shortAddr(addr, chars) {
  if (!addr) return "—";
  const c = chars || 4;
  return `${addr.slice(0, c + 2)}…${addr.slice(-4)}`;
}

// ============================================================
// NAV (visual only — single-page dashboard)
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      // Close mobile menu
      document.getElementById("sidebar").classList.remove("open");
    });
  });
});
