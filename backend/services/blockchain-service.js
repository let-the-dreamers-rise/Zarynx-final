const { ethers } = require("ethers");
const { config } = require("../config");

const providers = new Map();

const getChain = (networkKey) => {
  const chain = config.chains[networkKey];
  if (!chain) {
    throw new Error(`Unknown network: ${networkKey}`);
  }
  return chain;
};

const getProvider = (networkKey) => {
  if (!providers.has(networkKey)) {
    const chain = getChain(networkKey);
    providers.set(networkKey, new ethers.JsonRpcProvider(chain.rpcUrl, chain.chainId));
  }
  return providers.get(networkKey);
};

const getWallet = (networkKey, privateKey) => {
  if (!privateKey) {
    throw new Error(`Missing private key for ${networkKey}`);
  }
  return new ethers.Wallet(privateKey, getProvider(networkKey));
};

const getOwnerWallet = (networkKey) => getWallet(networkKey, config.keys.ownerPrivateKey);
const getAgentWallet = (networkKey) => getWallet(networkKey, config.keys.agentPrivateKey);

const explorerTxUrl = (networkKey, txHash) => `${getChain(networkKey).explorerBaseUrl}/tx/${txHash}`;
const explorerAddressUrl = (networkKey, address) => `${getChain(networkKey).explorerBaseUrl}/address/${address}`;

module.exports = {
  getChain,
  getProvider,
  getWallet,
  getOwnerWallet,
  getAgentWallet,
  explorerTxUrl,
  explorerAddressUrl,
};
