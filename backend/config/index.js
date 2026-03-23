const path = require("path");
const dotenv = require("dotenv");
const { ethers } = require("ethers");

const rootDir = path.resolve(__dirname, "..", "..");
dotenv.config({ path: path.join(rootDir, ".env.local") });
dotenv.config({ path: path.join(rootDir, ".env") });

const toBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const safeAddressFromKey = (privateKey) => {
  try {
    return privateKey ? new ethers.Wallet(privateKey).address : null;
  } catch (error) {
    return null;
  }
};

const port = Number(process.env.PORT || 4000);

const config = {
  rootDir,
  port,
  mockMode: toBool(process.env.MOCK_MODE, true),
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || `http://localhost:${port}`,
  chains: {
    sepolia: {
      key: "sepolia",
      label: "Ethereum Sepolia",
      chainId: 11155111,
      rpcUrl: process.env.ETHEREUM_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      explorerBaseUrl: "https://sepolia.etherscan.io",
    },
    baseSepolia: {
      key: "baseSepolia",
      label: "Base Sepolia",
      chainId: 84532,
      rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || "https://base-sepolia-rpc.publicnode.com",
      explorerBaseUrl: "https://sepolia.basescan.org",
    },
    statusSepolia: {
      key: "statusSepolia",
      label: "Status Sepolia",
      chainId: 1660990954,
      rpcUrl: process.env.STATUS_SEPOLIA_RPC_URL || "https://public.sepolia.rpc.status.network",
      explorerBaseUrl: "https://sepoliascan.status.network",
    },
  },
  keys: {
    ownerPrivateKey: process.env.OWNER_PRIVATE_KEY || "",
    ownerAddress: process.env.OWNER_ADDRESS || safeAddressFromKey(process.env.OWNER_PRIVATE_KEY),
    agentPrivateKey: process.env.AGENT_PRIVATE_KEY || "",
    agentAddress: process.env.AGENT_ADDRESS || safeAddressFromKey(process.env.AGENT_PRIVATE_KEY),
  },
  authority: {
    contractAddress: process.env.AUTHORITY_CONTRACT_ADDRESS || "",
    statusContractAddress: process.env.STATUS_AUTHORITY_CONTRACT_ADDRESS || "",
  },
  erc8004: {
    registryAddress: process.env.ERC8004_IDENTITY_REGISTRY_ADDRESS || "",
    agentId: process.env.ERC8004_AGENT_ID || "",
  },
  ens: {
    name: process.env.ENS_NAME || "vitalik.eth",
    rpcUrl: process.env.ENS_RPC_URL || "https://ethereum-rpc.publicnode.com",
  },
  locus: {
    baseUrl: process.env.LOCUS_BASE_URL || "https://beta-api.paywithlocus.com",
    apiKey: process.env.LOCUS_API_KEY || "",
    ownerPrivateKey: process.env.LOCUS_OWNER_PRIVATE_KEY || "",
    ownerAddress: process.env.LOCUS_OWNER_ADDRESS || safeAddressFromKey(process.env.LOCUS_OWNER_PRIVATE_KEY),
    walletId: process.env.LOCUS_WALLET_ID || "",
  },
  venice: {
    baseUrl: process.env.VENICE_BASE_URL || "https://api.venice.ai/api/v1",
    apiKey: process.env.VENICE_API_KEY || "",
    model: process.env.VENICE_MODEL || "llama-3.3-70b",
  },
  self: {
    scope: process.env.SELF_SCOPE || process.env.NEXT_PUBLIC_SELF_SCOPE || "",
    endpoint: process.env.SELF_ENDPOINT || process.env.NEXT_PUBLIC_SELF_ENDPOINT || "",
    appName: process.env.SELF_APP_NAME || process.env.NEXT_PUBLIC_SELF_APP_NAME || "ZARYNX VAAP",
    devMode: toBool(process.env.SELF_DEV_MODE, true),
  },
  filecoin: {
    privateKey: process.env.FILECOIN_PRIVATE_KEY || "",
    network: process.env.FILECOIN_NETWORK || "calibration",
    pinBin: process.env.FILECOIN_PIN_BIN || "npx",
    pinPackage: process.env.FILECOIN_PIN_PACKAGE || "filecoin-pin",
  },
  eigencompute: {
    url: process.env.EIGENCOMPUTE_URL || "",
    apiKey: process.env.EIGENCOMPUTE_API_KEY || "",
    attestationHeader: process.env.EIGENCOMPUTE_ATTESTATION_HEADER || "x-eigen-attestation",
  },
};

module.exports = { config };
