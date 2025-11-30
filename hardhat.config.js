require("@nomicfoundation/hardhat-toolbox");

const SEPOLIA_RPC_URL = "https://eth-mainnet.g.alchemy.com/v2/838gZZNNRj3yrYQPnapT0";

// 👇 paste your MetaMask exported key AFTER 0x
const PRIVATE_KEY = "0x16e7da56f654fc96d5ba819a95e61aa26c2685005fd344a77b9c7081bfc4082d"; 

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};
