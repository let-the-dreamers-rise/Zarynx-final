const axios = require("axios");
const { config } = require("../config");
const { isMockMode } = require("./mode-service");
const mockService = require("./mock-service");

async function runDecision(payload) {
  if (isMockMode()) {
    return mockService.runEigenDecision(payload);
  }

  if (!config.eigencompute.url) {
    throw new Error("EIGENCOMPUTE_URL is not configured");
  }

  const response = await axios.post(config.eigencompute.url, payload, {
    headers: {
      "Content-Type": "application/json",
      ...(config.eigencompute.apiKey
        ? { Authorization: `Bearer ${config.eigencompute.apiKey}` }
        : {}),
    },
    timeout: 45000,
  });

  return {
    output: response.data,
    attestation: response.headers[config.eigencompute.attestationHeader.toLowerCase()] || null,
  };
}

module.exports = {
  runDecision,
};
