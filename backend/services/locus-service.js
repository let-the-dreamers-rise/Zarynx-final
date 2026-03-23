const axios = require("axios");
const { config } = require("../config");
const { isMockMode } = require("./mode-service");
const mockService = require("./mock-service");

const requireConfig = () => {
  if (!config.locus.apiKey) {
    throw new Error("LOCUS_API_KEY is not configured");
  }
};

const client = () => {
  requireConfig();
  return axios.create({
    baseURL: `${config.locus.baseUrl}/api`,
    headers: {
      Authorization: `Bearer ${config.locus.apiKey}`,
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });
};

async function getStatus() {
  if (isMockMode()) {
    return mockService.getLocusStatus();
  }
  const response = await client().get("/status");
  return response.data;
}

async function getBalance() {
  if (isMockMode()) {
    return mockService.getLocusBalance();
  }
  const response = await client().get("/pay/balance");
  return response.data;
}

async function sendUsdc({ toAddress, amount, memo }) {
  if (isMockMode()) {
    return mockService.sendLocusTransfer({ toAddress, amount, memo });
  }
  const response = await client().post("/pay/send", {
    to_address: toAddress,
    amount,
    memo,
  });
  return response.data;
}

async function listTransactions(limit = 10) {
  if (isMockMode()) {
    return mockService.listLocusTransactions(limit);
  }
  const response = await client().get("/pay/transactions", {
    params: { limit },
  });
  return response.data;
}

async function getTransaction(transactionId) {
  if (isMockMode()) {
    return mockService.getLocusTransaction(transactionId);
  }
  const response = await client().get(`/pay/transactions/${transactionId}`);
  return response.data;
}

module.exports = {
  getStatus,
  getBalance,
  sendUsdc,
  listTransactions,
  getTransaction,
};
