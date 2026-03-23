const { ethers } = require("ethers");
const { config } = require("../config");
const { isMockMode } = require("./mode-service");
const mockService = require("./mock-service");

const provider = new ethers.JsonRpcProvider(config.ens.rpcUrl);

const isAddress = (value) => /^0x[a-fA-F0-9]{40}$/.test(value || "");

async function resolveName(input) {
  if (isMockMode()) {
    return mockService.resolveEns(input);
  }
  if (!input) {
    throw new Error("ENS input is required");
  }
  if (isAddress(input)) {
    return {
      input,
      address: ethers.getAddress(input),
      ensName: await provider.lookupAddress(input).catch(() => null),
    };
  }

  const address = await provider.resolveName(input);
  if (!address) {
    throw new Error(`Unable to resolve ENS name: ${input}`);
  }

  return {
    input,
    address,
    ensName: input,
  };
}

async function reverseLookup(address) {
  if (isMockMode()) {
    return mockService.reverseEns(address);
  }
  const normalized = ethers.getAddress(address);
  const ensName = await provider.lookupAddress(normalized);
  return {
    address: normalized,
    ensName,
  };
}

module.exports = {
  resolveName,
  reverseLookup,
};
