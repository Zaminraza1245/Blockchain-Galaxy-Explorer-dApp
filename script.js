console.log("Galaxy Explorer script loaded (ethers v5 with checks)");

// ================= CONFIG =================
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // <-- REPLACE THIS

// Minimal ABI matching GalaxyToken (ERC20 + rewardExplorer + burn)
const CONTRACT_ABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "explorer", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "rewardExplorer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ================= GLOBALS =================
let provider;
let signer;
let contract;
let currentAccount;

// Helper that tries multiple ids (since we changed HTML a few times)
const getElAny = (...ids) => {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) return el;
  }
  return null;
};

// DOM references
const connectBtn      = getElAny("connectWalletBtn", "connectWallet", "connectButton");
const refreshBtn      = getElAny("refreshBalancesBtn", "refreshDataButton");
const tokenNameEl     = getElAny("tokenName");
const tokenSymbolEl   = getElAny("tokenSymbol");
const totalSupplyEl   = getElAny("totalSupply");
const userBalanceEl   = getElAny("userBalance");
const connectedAddrEl = getElAny("connectedAddress", "walletAddress");
const statusEl        = getElAny("status", "statusArea");

const transferToEl      = getElAny("transferTo");
const transferAmountEl  = getElAny("transferAmount");
const transferBtn       = getElAny("transferBtn", "transferButton");

const burnAmountEl      = getElAny("burnAmount");
const burnBtn           = getElAny("burnBtn", "burnButton");

const rewardToEl        = getElAny("rewardTo", "rewardAddress");
const rewardAmountEl    = getElAny("rewardAmount");
const rewardBtn         = getElAny("rewardBtn", "rewardButton");

function setStatus(msg, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.style.color = isError ? "#ff6b6b" : "#7CFC00";
  console.log("STATUS:", msg);
}

// ================= HELPER: CHECK CONTRACT =================
async function checkContractDeployed() {
  if (!provider) {
    setStatus("Provider not ready.", true);
    return false;
  }

  try {
    console.log("Checking contract at:", CONTRACT_ADDRESS);
    const code = await provider.getCode(CONTRACT_ADDRESS);
    console.log("Bytecode at address:", code);

    if (!code || code === "0x") {
      setStatus(
        "No contract bytecode found at this address on the current network. " +
        "Make sure you deployed GalaxyToken to localhost and copied the correct address.",
        true
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("checkContractDeployed error:", err);
    setStatus("Failed to check contract code: " + (err.message || err), true);
    return false;
  }
}

// ================= WALLET + CONTRACT =================
async function connectWallet() {
  console.log("Connect Wallet clicked");
  try {
    if (!window.ethereum) {
      alert("MetaMask not found. Please install it.");
      return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    console.log("Connected network:", network);

    const accounts = await provider.send("eth_requestAccounts", []);
    currentAccount = accounts[0];
    console.log("Using account:", currentAccount);

    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    if (connectedAddrEl) {
      connectedAddrEl.textContent = currentAccount;
    }

    if (!(await checkContractDeployed())) {
      // Don’t try to call name/symbol if nothing is deployed there
      return;
    }

    setStatus("Wallet connected. Loading token data...");
    await loadTokenData();
  } catch (err) {
    console.error("connectWallet error:", err);
    setStatus("Failed to connect wallet: " + (err.message || err), true);
  }
}

async function loadTokenData() {
  if (!contract || !currentAccount) {
    setStatus("Contract or account not ready", true);
    return;
  }

  if (!(await checkContractDeployed())) {
    return;
  }

  try {
    const [name, symbol, totalSupplyRaw, balanceRaw] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.totalSupply(),
      contract.balanceOf(currentAccount),
    ]);

    const decimals = 18; // hard-coded

    console.log("Raw totalSupply:", totalSupplyRaw.toString());
    console.log("Raw balance:", balanceRaw.toString());

    const total = ethers.utils.formatUnits(totalSupplyRaw, decimals);
    const bal   = ethers.utils.formatUnits(balanceRaw, decimals);

    if (tokenNameEl)   tokenNameEl.textContent   = `${name} (${symbol})`;
    if (tokenSymbolEl) tokenSymbolEl.textContent = symbol;
    if (totalSupplyEl) totalSupplyEl.textContent = Number(total).toLocaleString();
    if (userBalanceEl) userBalanceEl.textContent = Number(bal).toLocaleString();

    setStatus("Token data loaded.");
  } catch (err) {
    console.error("loadTokenData error:", err);
    setStatus("Error loading token data: " + (err.message || err), true);
  }
}


// ================= WRITE FUNCTIONS =================
async function handleTransfer() {
  try {
    if (!contract) return;
    if (!(await checkContractDeployed())) return;

    const to        = (transferToEl?.value || "").trim();
    const amountStr = (transferAmountEl?.value || "").trim();
    if (!to || !amountStr) {
      alert("Enter recipient and amount.");
      return;
    }

    const amount = ethers.utils.parseUnits(amountStr, 18);
    setStatus("Sending transfer...");
    const tx = await contract.transfer(to, amount);
    await tx.wait();
    setStatus("Transfer confirmed in block " + tx.blockNumber);
    await loadTokenData();
  } catch (err) {
    console.error("handleTransfer error:", err);
    setStatus("Transfer failed: " + (err.message || err), true);
  }
}

// ----- Burn GLX (Spend Fuel) -----
async function handleBurn() {
  if (!signer || !contract || !currentAccount) {
    setStatus("Connect your wallet first before burning GLX.", true);
    return;
  }

  const rawAmount = (burnAmountEl?.value || "").trim();

  if (!rawAmount || Number(rawAmount) <= 0) {
    setStatus("Enter a positive burn amount.", true);
    return;
  }

  try {
    // amount in "whole GLX units" (e.g. "50" -> 50)
    const amountUnits = ethers.BigNumber.from(rawAmount);

    // Contract will internally do `amount * 1e18`,
    // so THIS is the real burn in wei:
    const burnAmountWei = amountUnits.mul(ethers.constants.WeiPerEther);

    const balanceWei = await contract.balanceOf(currentAccount);

    console.log("Burn request:", {
      rawAmount,
      amountUnits: amountUnits.toString(),
      burnAmountWei: burnAmountWei.toString(),
      balanceWei: balanceWei.toString(),
    });

    // safety: don't try to burn more than your balance
    if (burnAmountWei.gt(balanceWei)) {
      const humanBal = ethers.utils.formatUnits(balanceWei, 18);
      setStatus(
        `Cannot burn more than your balance. You have ${humanBal} GLX.`,
        true
      );
      return;
    }

    setStatus("STATUS: Sending burn...");

    // IMPORTANT: send plain units to match the contract
    const tx = await contract.burn(amountUnits);
    setStatus(`STATUS: Burn tx sent: ${tx.hash.substring(0, 10)}…`);

    await tx.wait();
    setStatus(`STATUS: Successfully burned ${rawAmount} GLX ✅`);

    await loadTokenData();
  } catch (err) {
    console.error("handleBurn error:", err);
    setStatus(
      `Burn failed: ${err.reason || err.message || "Unknown error"}`,
      true
    );
  }
}




async function handleReward() {
  try {
    if (!contract || !currentAccount) {
      setStatus("Connect your wallet first before rewarding an explorer.", true);
      return;
    }
    if (!(await checkContractDeployed())) return;

    const to        = (rewardToEl?.value || "").trim();
    const amountStr = (rewardAmountEl?.value || "").trim();
    if (!to || !amountStr) {
      alert("Enter explorer address and amount.");
      return;
    }

    const amount = ethers.utils.parseUnits(amountStr, 18);

    setStatus("STATUS: Sending reward...");

    const tx = await contract.rewardExplorer(to, amount);
    setStatus(`STATUS: Reward tx sent: ${tx.hash.substring(0, 10)}…`);

    const receipt = await tx.wait();
    setStatus(
      `STATUS: Reward confirmed in block ${receipt.blockNumber} ✅`
    );
  } catch (err) {
    console.error("handleReward error:", err);
    setStatus("Reward failed: " + (err.reason || err.message || err), true);
  }
}


// ================= WIRE EVENTS =================
window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, wiring buttons (ethers v5)");
  if (connectBtn)  connectBtn.addEventListener("click", connectWallet);
  if (refreshBtn)  refreshBtn.addEventListener("click", loadTokenData);
  if (transferBtn) transferBtn.addEventListener("click", handleTransfer);
  if (burnBtn)     burnBtn.addEventListener("click", handleBurn);
  if (rewardBtn)   rewardBtn.addEventListener("click", handleReward);
});
