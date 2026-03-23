const crypto = require("crypto");
const { ethers } = require("ethers");
const { config } = require("../config");
const { readRuntime, writeRuntime } = require("./log-service");

const MOCK_RUNTIME_KEY = "mock-state";
const VITALIK_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

const hashHex = (value, length = 64) =>
  crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, length);

const addressFor = (label) => ethers.getAddress(`0x${hashHex(`zarynx:${label}`, 40)}`);
const txHashFor = (label) => `0x${hashHex(`${label}:${Date.now()}:${crypto.randomUUID()}`, 64)}`;
const cidFor = (label) => `bafy${hashHex(`cid:${label}`, 55)}`;
const dataSetIdFor = (label) => `${hashHex(`dataset:${label}`, 8)}-${hashHex(`dataset-tail:${label}`, 4)}`;

const ownerAddress = () => config.keys.ownerAddress || addressFor("owner");
const agentAddress = () => config.keys.agentAddress || addressFor("agent");

const defaultAuthorityState = (networkKey) => {
  const isStatus = networkKey === "statusSepolia";
  return {
    network: networkKey,
    address:
      (isStatus ? config.authority.statusContractAddress : config.authority.contractAddress) ||
      addressFor(`authority:${networkKey}`),
    owner: ownerAddress(),
    agent: agentAddress(),
    maxSpendEth: isStatus ? "0.0001" : "0.0005",
    active: true,
    allowedTargets: [ownerAddress(), VITALIK_ADDRESS],
    balanceEth: isStatus ? "0.025" : "0.08",
    executions: [],
  };
};

const baseState = () => ({
  createdAt: new Date().toISOString(),
  authority: {
    baseSepolia: defaultAuthorityState("baseSepolia"),
    statusSepolia: defaultAuthorityState("statusSepolia"),
  },
  locus: {
    walletId: config.locus.walletId || `locus-wallet-${hashHex("wallet-id", 12)}`,
    walletAddress: addressFor("locus-wallet"),
    ownerAddress: ownerAddress(),
    walletStatus: "ready",
    usdcBalance: "1250.00",
    allowance: "2500.00",
    transactions: [],
  },
  identity: {
    registryAddress: config.erc8004.registryAddress || addressFor("erc8004-registry"),
    nextAgentId: Number(config.erc8004.agentId || 4101),
    records: {},
  },
  filecoinUploads: [],
});

const withDefaults = (state) => {
  const initial = baseState();
  const next = {
    ...initial,
    ...(state || {}),
  };

  next.authority = {
    baseSepolia: { ...initial.authority.baseSepolia, ...(state?.authority?.baseSepolia || {}) },
    statusSepolia: { ...initial.authority.statusSepolia, ...(state?.authority?.statusSepolia || {}) },
  };

  next.locus = {
    ...initial.locus,
    ...(state?.locus || {}),
  };

  next.identity = {
    ...initial.identity,
    ...(state?.identity || {}),
    records: state?.identity?.records || {},
  };

  next.filecoinUploads = state?.filecoinUploads || [];
  return next;
};

const readState = () => withDefaults(readRuntime(MOCK_RUNTIME_KEY, baseState()));
const writeState = (state) => writeRuntime(MOCK_RUNTIME_KEY, withDefaults(state));

const mutate = (fn) => {
  const current = readState();
  const next = fn(current) || current;
  writeState(next);
  return next;
};

const toWeiString = (eth) => ethers.parseEther(String(eth)).toString();
const explorerTxUrl = (networkKey, txHash) => `${config.chains[networkKey].explorerBaseUrl}/tx/${txHash}`;

const getAuthorityState = (networkKey) => {
  const state = readState().authority[networkKey];
  return {
    network: networkKey,
    address: state.address,
    owner: state.owner,
    agent: state.agent,
    maxSpendWei: toWeiString(state.maxSpendEth),
    maxSpendEth: state.maxSpendEth,
    active: state.active,
    allowedTargets: state.allowedTargets,
    balanceWei: toWeiString(state.balanceEth),
    balanceEth: state.balanceEth,
    mode: "mock",
  };
};

const getRecentExecutions = (networkKey) =>
  readState().authority[networkKey].executions.slice().reverse().slice(0, 20);

const updateAuthority = ({ networkKey, newAgent, maxSpendEth, active }) => {
  mutate((state) => {
    const current = state.authority[networkKey];
    state.authority[networkKey] = {
      ...current,
      agent: newAgent || current.agent,
      maxSpendEth: maxSpendEth === undefined ? current.maxSpendEth : String(maxSpendEth),
      active: active === undefined ? current.active : Boolean(active),
    };
    return state;
  });

  const txHash = txHashFor(`update-authority:${networkKey}`);
  return {
    txHash,
    explorerUrl: explorerTxUrl(networkKey, txHash),
    blockNumber: 100000 + getRecentExecutions(networkKey).length,
    state: getAuthorityState(networkKey),
    mode: "mock",
  };
};

const setTarget = ({ networkKey, target, allowed }) => {
  const normalizedTarget = ethers.getAddress(target);
  const state = mutate((draft) => {
    const current = draft.authority[networkKey];
    draft.authority[networkKey].allowedTargets = allowed
      ? Array.from(new Set([...current.allowedTargets, normalizedTarget]))
      : current.allowedTargets.filter((entry) => entry !== normalizedTarget);
    return draft;
  });

  const txHash = txHashFor(`set-target:${networkKey}:${normalizedTarget}:${allowed}`);
  return {
    txHash,
    explorerUrl: explorerTxUrl(networkKey, txHash),
    blockNumber: 110000 + state.authority[networkKey].allowedTargets.length,
    allowedTargets: state.authority[networkKey].allowedTargets,
    mode: "mock",
  };
};

const revoke = (networkKey) => {
  mutate((state) => {
    state.authority[networkKey].active = false;
    return state;
  });
  const txHash = txHashFor(`revoke:${networkKey}`);
  return {
    txHash,
    explorerUrl: explorerTxUrl(networkKey, txHash),
    blockNumber: 120000 + getRecentExecutions(networkKey).length,
    mode: "mock",
  };
};

const reactivate = (networkKey) => {
  mutate((state) => {
    state.authority[networkKey].active = true;
    return state;
  });
  const txHash = txHashFor(`reactivate:${networkKey}`);
  return {
    txHash,
    explorerUrl: explorerTxUrl(networkKey, txHash),
    blockNumber: 130000 + getRecentExecutions(networkKey).length,
    mode: "mock",
  };
};

const execute = ({ networkKey, target, amountEth, data = "0x", reason = "policy-execution" }) => {
  const state = readState().authority[networkKey];
  const normalizedTarget = ethers.getAddress(target);
  const numericAmount = Number(amountEth);
  const maxSpend = Number(state.maxSpendEth);

  if (!state.active) {
    throw new Error(`Authority for ${networkKey} is revoked`);
  }
  if (!state.allowedTargets.includes(normalizedTarget)) {
    throw new Error(`Authority rejected target ${normalizedTarget}`);
  }
  if (Number.isNaN(numericAmount) || numericAmount > maxSpend) {
    throw new Error(`Authority rejected amount ${amountEth} ETH because max spend is ${state.maxSpendEth} ETH`);
  }

  const txHash = txHashFor(`execute:${networkKey}:${normalizedTarget}:${amountEth}:${reason}`);
  const executionRef = `0x${hashHex(`execution-ref:${txHash}`, 64)}`;
  const execution = {
    txHash,
    explorerUrl: explorerTxUrl(networkKey, txHash),
    blockNumber: 140000 + state.executions.length + 1,
    executionRef,
    agent: state.agent,
    target: normalizedTarget,
    amountWei: toWeiString(amountEth),
    amountEth: String(amountEth),
    reason,
    success: true,
    data,
    mode: "mock",
  };

  mutate((draft) => {
    draft.authority[networkKey].balanceEth = Math.max(
      0,
      Number(draft.authority[networkKey].balanceEth) - numericAmount
    ).toFixed(6);
    draft.authority[networkKey].executions.push(execution);
    return draft;
  });

  return execution;
};

const getLocusStatus = () => {
  const state = readState().locus;
  return {
    success: true,
    data: {
      walletId: state.walletId,
      walletAddress: state.walletAddress,
      walletStatus: state.walletStatus === "simulated" ? "ready" : state.walletStatus,
      ownerAddress: state.ownerAddress,
      network: "base-sepolia",
    },
    mode: "mock",
  };
};

const getLocusBalance = () => {
  const state = readState().locus;
  return {
    success: true,
    data: {
      usdc_balance: state.usdcBalance,
      allowance: state.allowance,
    },
    mode: "mock",
  };
};

const sendLocusTransfer = ({ toAddress, amount, memo }) => {
  const txHash = txHashFor(`locus:${toAddress}:${amount}:${memo || ""}`);
  const transaction = {
    id: `loc-tx-${hashHex(txHash, 12)}`,
    tx_hash: txHash,
    to_address: ethers.getAddress(toAddress),
    amount: String(amount),
    memo: memo || null,
    asset: "USDC",
    network: "base-sepolia",
    status: "confirmed",
    created_at: new Date().toISOString(),
  };

  mutate((state) => {
    state.locus.transactions.push(transaction);
    state.locus.usdcBalance = Math.max(0, Number(state.locus.usdcBalance) - Number(amount)).toFixed(2);
    return state;
  });

  return {
    success: true,
    data: {
      transaction,
    },
    mode: "mock",
  };
};

const listLocusTransactions = (limit = 10) => ({
  success: true,
  data: readState().locus.transactions.slice().reverse().slice(0, limit),
  mode: "mock",
});

const getLocusTransaction = (transactionId) => {
  const transaction = readState().locus.transactions.find((entry) => entry.id === transactionId);
  if (!transaction) {
    throw new Error(`Locus transaction not found: ${transactionId}`);
  }
  return {
    success: true,
    data: transaction,
    mode: "mock",
  };
};

const resolveEns = (input) => {
  if (!input) {
    throw new Error("ENS input is required");
  }
  if (/^0x[a-fA-F0-9]{40}$/.test(input)) {
    return {
      input,
      address: ethers.getAddress(input),
      ensName: input.toLowerCase() === VITALIK_ADDRESS.toLowerCase() ? "vitalik.eth" : `vault-${input.slice(2, 8)}.eth`,
      mode: "mock",
    };
  }

  const normalized = String(input).toLowerCase();
  const address =
    normalized === "vitalik.eth" || normalized === String(config.ens.name).toLowerCase()
      ? VITALIK_ADDRESS
      : addressFor(`ens:${normalized}`);

  return {
    input,
    address,
    ensName: input,
    mode: "mock",
  };
};

const reverseEns = (address) => {
  const normalized = ethers.getAddress(address);
  return {
    address: normalized,
    ensName: normalized.toLowerCase() === VITALIK_ADDRESS.toLowerCase() ? "vitalik.eth" : `vault-${normalized.slice(2, 8)}.eth`,
    mode: "mock",
  };
};

const registerIdentity = ({ agentUri, ownerAddress: agentOwner, networkKey = "baseSepolia" }) => {
  const current = readState();
  const agentId = String(current.identity.nextAgentId);
  const txHash = txHashFor(`register-identity:${agentId}:${agentUri}`);
  const record = {
    agentId,
    ownerAddress: agentOwner || ownerAddress(),
    tokenUri: agentUri,
    networkKey,
    txHash,
    registeredAt: new Date().toISOString(),
    mode: "mock",
  };

  mutate((state) => {
    state.identity.records[agentId] = record;
    state.identity.nextAgentId += 1;
    return state;
  });

  return {
    txHash,
    explorerUrl: explorerTxUrl(networkKey, txHash),
    agentId,
    mode: "mock",
  };
};

const readRegisteredAgent = (agentId) => {
  const record = readState().identity.records[String(agentId)];
  if (!record) {
    throw new Error(`ERC-8004 record not found for agent ${agentId}`);
  }
  return {
    agentId: String(agentId),
    tokenUri: record.tokenUri,
    mode: "mock",
  };
};

const uploadArtifact = (filePath, options = {}) => {
  const cid = cidFor(`${filePath}:${JSON.stringify(options)}`);
  const dataSetId = dataSetIdFor(`${filePath}:${cid}`);

  mutate((state) => {
    state.filecoinUploads.push({
      cid,
      dataSetId,
      filePath,
      options,
      createdAt: new Date().toISOString(),
      mode: "mock",
    });
    return state;
  });

  return {
    cid,
    dataSetId,
    raw: `Filecoin Pin upload receipt for ${filePath}`,
    mode: "mock",
  };
};

const runEigenDecision = (payload) => ({
  output: {
    verdict: "accepted",
    confidence: 0.97,
    enclave: "zarynx-tee-a1",
    payload,
    decidedAt: new Date().toISOString(),
  },
  attestation: `tee-attestation-${hashHex(JSON.stringify(payload), 18)}`,
  mode: "mock",
});

const parseAmount = (intent) => {
  const match = String(intent).match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
};

const parseTarget = (intent) => {
  const ensMatch = String(intent).match(/\b[a-z0-9-]+\.eth\b/i);
  const addressMatch = String(intent).match(/\b0x[a-fA-F0-9]{40}\b/);
  return ensMatch?.[0] || addressMatch?.[0] || config.ens.name || "vitalik.eth";
};

const reasonIntent = ({ intent }) => {
  const lower = String(intent).toLowerCase();
  const target = parseTarget(intent);
  const amount = parseAmount(intent);

  if (lower.includes("filecoin") || lower.includes("upload") || lower.includes("cid")) {
    return {
      action: "upload_log",
      target: null,
      amount: null,
      network: "none",
      asset: "NONE",
      reason: "Filecoin evidence upload",
      memo: null,
      requiresIdentity: false,
    };
  }

  if (lower.includes("register") && lower.includes("identity")) {
    return {
      action: "register_identity",
      target: null,
      amount: null,
      network: "baseSepolia",
      asset: "NONE",
      reason: "ERC-8004 registration",
      memo: null,
      requiresIdentity: false,
    };
  }

  if (lower.includes("usdc") || lower.includes("locus")) {
    return {
      action: "locus_transfer",
      target,
      amount: amount || 0.1,
      network: "base",
      asset: "USDC",
      reason: "Locus settlement",
      memo: "ZARYNX settlement",
      requiresIdentity: true,
    };
  }

  if (lower.includes("status") && (lower.includes("transfer") || lower.includes("send") || lower.includes("move"))) {
    return {
      action: "status_transfer",
      target,
      amount: amount || 0.00005,
      network: "statusSepolia",
      asset: "ETH",
      reason: "Status authority execution",
      memo: null,
      requiresIdentity: true,
    };
  }

  if (lower.includes("transfer") || lower.includes("send") || lower.includes("move")) {
    return {
      action: "onchain_transfer",
      target,
      amount: amount || 0.0002,
      network: "baseSepolia",
      asset: "ETH",
      reason: "Base authority execution",
      memo: null,
      requiresIdentity: true,
    };
  }

  if (lower.includes("resolve") || lower.includes(".eth")) {
    return {
      action: "resolve_ens",
      target,
      amount: null,
      network: "none",
      asset: "NONE",
      reason: "ENS resolution",
      memo: null,
      requiresIdentity: false,
    };
  }

  return {
    action: "none",
    target: null,
    amount: null,
    network: "none",
    asset: "NONE",
    reason: "No executable action matched the request",
    memo: null,
    requiresIdentity: false,
  };
};

module.exports = {
  addressFor,
  cidFor,
  execute,
  getAuthorityState,
  getLocusBalance,
  getLocusStatus,
  getLocusTransaction,
  getRecentExecutions,
  listLocusTransactions,
  reactivate,
  readRegisteredAgent,
  reasonIntent,
  registerIdentity,
  resolveEns,
  reverseEns,
  revoke,
  runEigenDecision,
  sendLocusTransfer,
  setTarget,
  updateAuthority,
  uploadArtifact,
};
