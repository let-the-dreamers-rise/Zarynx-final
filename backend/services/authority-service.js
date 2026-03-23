const { ethers } = require("ethers");
const { config } = require("../config");
const { authorityManagerAbi } = require("./abi");
const { isMockMode } = require("./mode-service");
const mockService = require("./mock-service");
const {
  explorerTxUrl,
  getAgentWallet,
  getOwnerWallet,
  getProvider,
} = require("./blockchain-service");

const getAuthorityAddress = (networkKey) => {
  if (networkKey === "statusSepolia") {
    return config.authority.statusContractAddress;
  }
  return config.authority.contractAddress;
};

const getAuthorityContract = (networkKey, signerType = "read") => {
  const address = getAuthorityAddress(networkKey);
  if (!address) {
    throw new Error(`Authority contract is not configured for ${networkKey}`);
  }

  if (signerType === "owner") {
    return new ethers.Contract(address, authorityManagerAbi, getOwnerWallet(networkKey));
  }
  if (signerType === "agent") {
    return new ethers.Contract(address, authorityManagerAbi, getAgentWallet(networkKey));
  }
  return new ethers.Contract(address, authorityManagerAbi, getProvider(networkKey));
};

async function getState(networkKey = "baseSepolia") {
  if (isMockMode()) {
    return mockService.getAuthorityState(networkKey);
  }

  const contract = getAuthorityContract(networkKey);
  const [owner, agent, maxSpend, active, allowedTargets, balance] = await Promise.all([
    contract.owner(),
    contract.agent(),
    contract.maxSpend(),
    contract.active(),
    contract.getAllowedTargets(),
    getProvider(networkKey).getBalance(await contract.getAddress()),
  ]);

  return {
    network: networkKey,
    address: await contract.getAddress(),
    owner,
    agent,
    maxSpendWei: maxSpend.toString(),
    maxSpendEth: ethers.formatEther(maxSpend),
    active,
    allowedTargets,
    balanceWei: balance.toString(),
    balanceEth: ethers.formatEther(balance),
  };
}

async function updateAuthority({ networkKey = "baseSepolia", newAgent, maxSpendEth, active }) {
  if (isMockMode()) {
    return mockService.updateAuthority({ networkKey, newAgent, maxSpendEth, active });
  }

  const contract = getAuthorityContract(networkKey, "owner");
  const tx = await contract.updateAuthority(
    newAgent,
    ethers.parseEther(String(maxSpendEth)),
    active
  );
  const receipt = await tx.wait();
  return {
    txHash: tx.hash,
    explorerUrl: explorerTxUrl(networkKey, tx.hash),
    blockNumber: receipt.blockNumber,
  };
}

async function setTarget({ networkKey = "baseSepolia", target, allowed }) {
  if (isMockMode()) {
    return mockService.setTarget({ networkKey, target, allowed });
  }

  const contract = getAuthorityContract(networkKey, "owner");
  const tx = await contract.setTarget(target, allowed);
  const receipt = await tx.wait();
  return {
    txHash: tx.hash,
    explorerUrl: explorerTxUrl(networkKey, tx.hash),
    blockNumber: receipt.blockNumber,
  };
}

async function revoke(networkKey = "baseSepolia") {
  if (isMockMode()) {
    return mockService.revoke(networkKey);
  }

  const contract = getAuthorityContract(networkKey, "owner");
  const tx = await contract.revoke();
  const receipt = await tx.wait();
  return {
    txHash: tx.hash,
    explorerUrl: explorerTxUrl(networkKey, tx.hash),
    blockNumber: receipt.blockNumber,
  };
}

async function reactivate(networkKey = "baseSepolia") {
  if (isMockMode()) {
    return mockService.reactivate(networkKey);
  }

  const contract = getAuthorityContract(networkKey, "owner");
  const tx = await contract.reactivate();
  const receipt = await tx.wait();
  return {
    txHash: tx.hash,
    explorerUrl: explorerTxUrl(networkKey, tx.hash),
    blockNumber: receipt.blockNumber,
  };
}

async function execute({ networkKey = "baseSepolia", target, amountEth, data = "0x", reason = "zarynx-agent" }) {
  if (isMockMode()) {
    return mockService.execute({ networkKey, target, amountEth, data, reason });
  }

  const contract = getAuthorityContract(networkKey, "agent");
  const executionRef = ethers.hexlify(ethers.randomBytes(32));
  const tx = await contract.execute(
    target,
    ethers.parseEther(String(amountEth)),
    data,
    reason,
    executionRef
  );
  const receipt = await tx.wait();
  return {
    txHash: tx.hash,
    explorerUrl: explorerTxUrl(networkKey, tx.hash),
    blockNumber: receipt.blockNumber,
    executionRef,
  };
}

async function recentExecutions(networkKey = "baseSepolia") {
  if (isMockMode()) {
    return mockService.getRecentExecutions(networkKey);
  }

  const contract = getAuthorityContract(networkKey);
  const currentBlock = await getProvider(networkKey).getBlockNumber();
  const fromBlock = Math.max(0, currentBlock - 5000);
  const events = await contract.queryFilter(contract.filters.ExecutionAttempt(), fromBlock, currentBlock);
  return events
    .slice(-20)
    .reverse()
    .map((event) => ({
      txHash: event.transactionHash,
      blockNumber: event.blockNumber,
      agent: event.args.agent,
      target: event.args.target,
      amountWei: event.args.amount.toString(),
      amountEth: ethers.formatEther(event.args.amount),
      reason: event.args.reason,
      executionRef: event.args.executionRef,
      success: event.args.success,
    }));
}

module.exports = {
  getState,
  updateAuthority,
  setTarget,
  revoke,
  reactivate,
  execute,
  recentExecutions,
};
