# Galaxy Explorer dApp – GalaxyToken (GLX)

## 1. Theme & Concept

Galaxy Explorer is a themed decentralized application (dApp) built for the course **MG3012 – Blockchain Technology for Business**.

The dApp simulates an intergalactic mission control where explorers are rewarded with a custom ERC-20 token called **GalaxyToken (GLX)** for completing space missions. Token holders can:

- View their GLX balance
- Transfer GLX to other explorers
- Burn GLX to simulate "spending fuel"
- (Owner only) Reward explorers with new GLX

## 2. Tech Stack

- **Smart Contract:** Solidity (ERC-20 using OpenZeppelin)
- **Network:** Ethereum testnet (Sepolia or other)
- **Framework/Tools:** Hardhat, MetaMask, Ethers.js
- **Frontend:** HTML, CSS, JavaScript (no framework)
- **Wallet Integration:** MetaMask via `window.ethereum`

## 3. Smart Contract (GalaxyToken.sol)

Key points:

- Inherits from `ERC20` and `Ownable` (OpenZeppelin).
- Name: `GalaxyToken`
- Symbol: `GLX`
- Initial supply: `1,000,000 GLX` minted to the deployer (Mission Control).
- Custom functions:
  - `rewardExplorer(address explorer, uint256 amount)`  
    - Only owner can call.  
    - Mints `amount` GLX (in whole tokens) to the explorer.
  - `burn(uint256 amount)`  
    - Any holder can burn (destroy) their own GLX.
  - `balanceInWholeTokens(address account)`  
    - Convenience view function returning balance in full GLX.

The token follows the ERC-20 standard so it remains compatible with wallets and other dApps.

## 4. Frontend Features

The frontend is inside the `frontend/` folder:

- `index.html`
- `style.css`
- `script.js`

User-facing features:

1. **Connect Wallet**
   - Connects MetaMask to the dApp using Ethers.js.
   - Displays the connected wallet address.

2. **Token Dashboard**
   - Reads and displays:
     - Token name and symbol
     - Total supply
     - User's GLX balance
   - Uses `name()`, `symbol()`, `totalSupply()`, and `balanceOf()` from the contract.

3. **Transfer GLX**
   - Recipient address + amount input.
   - Calls `transfer(to, amount)` on the smart contract.
   - Amount is converted using `ethers.utils.parseUnits` based on token decimals.

4. **Burn GLX**
   - User enters an amount in GLX.
   - Calls `burn(amount)` to destroy tokens.
   - Demonstrates token burning and supply reduction.

5. **Reward Explorer (Owner Only)**
   - Owner enters an explorer address and reward amount.
   - Calls `rewardExplorer(address, amount)`.
   - Non-owner calls will revert with an error.

All status messages (success/error) are displayed in a dedicated **Status** panel.

## 5. Deployment (Hardhat + Sepolia)

1. Install dependencies:

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
```

2. Compile contract:

```bash
npx hardhat compile
```

3. Configure `hardhat.config.js` with:
   - `SEPOLIA_RPC_URL`
   - `PRIVATE_KEY` for your MetaMask account (with test ETH)

4. Deploy:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

5. Copy the deployed contract address into `frontend/script.js`:

```javascript
const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_ADDRESS";
```

## 6. Running the Frontend

- Open `frontend/index.html` in a browser (e.g., using VS Code Live Server).
- Make sure MetaMask is:
  - Installed
  - Connected to the correct testnet (Sepolia or whichever you deployed to).
- Click **"Connect Wallet"** and start interacting with the dApp.

## 8. Contract Details

- **Network:** Harhat local 
- **Contract Address:** ``
- **Token Symbol:** GLX
- **Decimals:** 18
