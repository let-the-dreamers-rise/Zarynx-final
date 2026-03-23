const { ethers } = require("ethers");
const { config } = require("../config");
const { agentIdentityRegistryAbi } = require("./abi");
const { isMockMode } = require("./mode-service");
const mockService = require("./mock-service");
const { explorerTxUrl, getOwnerWallet, getProvider } = require("./blockchain-service");
const { readAgentCard, writeAgentCard, readAgentLog } = require("./log-service");

const getRegistry = (networkKey = "baseSepolia", write = false) => {
  if (!config.erc8004.registryAddress) {
    throw new Error("ERC8004_IDENTITY_REGISTRY_ADDRESS is not configured");
  }

  return new ethers.Contract(
    config.erc8004.registryAddress,
    agentIdentityRegistryAbi,
    write ? getOwnerWallet(networkKey) : getProvider(networkKey)
  );
};

function buildAgentCard(overrides = {}) {
  const current = readAgentCard();
  const log = readAgentLog();
  const registryAddress = config.erc8004.registryAddress || mockService.addressFor("erc8004-registry");
  const agentId = config.erc8004.agentId || current.identity?.agentId || null;
  const ipfsUri = current.ipfsUri || `ipfs://${mockService.cidFor("agent-card")}`;
  const card = {
    ...current,
    standard: "ERC-8004",
    name: "ZARYNX VAAP",
    version: "1.0.0",
    description:
      "Verifiable Agent Authority Protocol agent enforcing bounded execution rights across on-chain and API actions.",
    agent: {
      ownerAddress: config.keys.ownerAddress,
      agentAddress: config.keys.agentAddress,
      locusOwnerAddress: config.locus.ownerAddress,
      locusWalletId: config.locus.walletId,
    },
    authority: {
      baseSepolia: config.authority.contractAddress || null,
      statusSepolia: config.authority.statusContractAddress || null,
    },
    identity: {
      registryAddress,
      agentId,
    },
    integrations: {
      ens: config.ens.name,
      self: config.self.scope || (config.mockMode ? "mock-self-scope" : null),
      venice: config.mockMode ? "mock-venice-router" : config.venice.model || null,
      filecoinNetwork: config.filecoin.network,
      locusBaseUrl: config.locus.baseUrl,
    },
    evidence: {
      ...(current.evidence || {}),
      latestLogEntryCount: log.entries?.length || 0,
      mockMode: config.mockMode,
    },
    mode: config.mockMode ? "mock" : "live",
    ipfsUri,
    updatedAt: new Date().toISOString(),
    ...overrides,
  };

  writeAgentCard(card);
  return card;
}

async function registerAgentIdentity({ agentUri, ownerAddress, networkKey = "baseSepolia" }) {
  if (isMockMode()) {
    const result = mockService.registerIdentity({ agentUri, ownerAddress, networkKey });
    buildAgentCard({
      identity: {
        registryAddress: config.erc8004.registryAddress || mockService.addressFor("erc8004-registry"),
        agentId: result.agentId,
      },
      ipfsUri: agentUri,
    });
    return result;
  }

  const registry = getRegistry(networkKey, true);
  const tx = await registry.registerAgent(ownerAddress || config.keys.ownerAddress, agentUri);
  const receipt = await tx.wait();
  const event = receipt.logs
    .map((log) => {
      try {
        return registry.interface.parseLog(log);
      } catch (error) {
        return null;
      }
    })
    .find(Boolean);

  const result = {
    txHash: tx.hash,
    explorerUrl: explorerTxUrl(networkKey, tx.hash),
    agentId: event?.args?.agentId?.toString() || null,
  };
  buildAgentCard({
    identity: {
      registryAddress: config.erc8004.registryAddress || null,
      agentId: result.agentId,
    },
    ipfsUri: agentUri,
  });
  return result;
}

async function readRegisteredAgent(agentId, networkKey = "baseSepolia") {
  if (isMockMode()) {
    return mockService.readRegisteredAgent(agentId, networkKey);
  }

  const registry = getRegistry(networkKey, false);
  const uri = await registry.tokenURI(agentId);
  return {
    agentId,
    tokenUri: uri,
  };
}

module.exports = {
  buildAgentCard,
  registerAgentIdentity,
  readRegisteredAgent,
};
