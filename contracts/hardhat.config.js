import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const getAccounts = (...keys) =>
  keys
    .map((key) => process.env[key])
    .filter(Boolean);

/** @type {import('hardhat/config').HardhatUserConfig} */
const config = {
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "paris",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      type: "http",
      url: process.env.ETHEREUM_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: getAccounts("OWNER_PRIVATE_KEY", "AGENT_PRIVATE_KEY"),
    },
    baseSepolia: {
      type: "http",
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://base-sepolia-rpc.publicnode.com",
      accounts: getAccounts("OWNER_PRIVATE_KEY", "AGENT_PRIVATE_KEY"),
    },
    statusSepolia: {
      type: "http",
      url: process.env.STATUS_SEPOLIA_RPC_URL || "https://public.sepolia.rpc.status.network",
      chainId: 1660990954,
      accounts: getAccounts("OWNER_PRIVATE_KEY", "AGENT_PRIVATE_KEY"),
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
