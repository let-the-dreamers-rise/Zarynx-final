const express = require("express");
const { config } = require("../config");
const locusService = require("../services/locus-service");
const { resolveName, reverseLookup } = require("../services/ens-service");
const selfService = require("../services/self-service");
const erc8004Service = require("../services/erc8004-service");
const filecoinService = require("../services/filecoin-service");
const eigencomputeService = require("../services/eigencompute-service");
const { readAgentCard, readAgentLog, readConversation, paths, readRuntime } = require("../services/log-service");
const authorityService = require("../services/authority-service");

const router = express.Router();

router.get("/dashboard", async (_req, res) => {
  const collect = async (fn) => {
    try {
      return await fn();
    } catch (error) {
      return { error: error.message };
    }
  };

  res.json({
    protocol: "ZARYNX VAAP",
    generatedAt: new Date().toISOString(),
    config: {
      ensName: config.ens.name,
      selfScope: config.self.scope || null,
      veniceModel: config.mockMode ? "mock-venice-router" : config.venice.model || null,
      mockMode: config.mockMode,
    },
    authority: {
      baseSepolia: await collect(() => authorityService.getState("baseSepolia")),
      statusSepolia: await collect(() => authorityService.getState("statusSepolia")),
    },
    recentExecutions: {
      baseSepolia: await collect(() => authorityService.recentExecutions("baseSepolia")),
      statusSepolia: await collect(() => authorityService.recentExecutions("statusSepolia")),
    },
    locus: {
      status: await collect(() => locusService.getStatus()),
      balance: await collect(() => locusService.getBalance()),
      transactions: await collect(() => locusService.listTransactions(10)),
    },
    ens: await collect(() => resolveName(config.ens.name)),
    agentCard: readAgentCard(),
    agentLog: readAgentLog(),
    conversation: readConversation(),
    lastIntent: readRuntime("last-intent", {}),
  });
});

router.get("/locus/status", async (_req, res, next) => {
  try {
    res.json(await locusService.getStatus());
  } catch (error) {
    next(error);
  }
});

router.get("/locus/balance", async (_req, res, next) => {
  try {
    res.json(await locusService.getBalance());
  } catch (error) {
    next(error);
  }
});

router.post("/locus/send", async (req, res, next) => {
  try {
    res.json(await locusService.sendUsdc(req.body));
  } catch (error) {
    next(error);
  }
});

router.get("/ens/resolve", async (req, res, next) => {
  try {
    res.json(await resolveName(req.query.name));
  } catch (error) {
    next(error);
  }
});

router.get("/ens/reverse", async (req, res, next) => {
  try {
    res.json(await reverseLookup(req.query.address));
  } catch (error) {
    next(error);
  }
});

router.post("/self/session", async (_req, res, next) => {
  try {
    res.json(selfService.createSession());
  } catch (error) {
    next(error);
  }
});

router.get("/self/session/:userId", async (req, res, next) => {
  try {
    res.json(selfService.getSession(req.params.userId));
  } catch (error) {
    next(error);
  }
});

router.post("/self/verify", async (req, res, next) => {
  try {
    res.json(await selfService.verifyProof(req.body));
  } catch (error) {
    next(error);
  }
});

router.post("/erc8004/register", async (req, res, next) => {
  try {
    res.json(await erc8004Service.registerAgentIdentity(req.body));
  } catch (error) {
    next(error);
  }
});

router.post("/filecoin/upload-log", async (_req, res, next) => {
  try {
    res.json(
      await filecoinService.uploadArtifact(paths.agentLogPath, {
        artifactType: "registration",
        agentId: config.erc8004.agentId || undefined,
      })
    );
  } catch (error) {
    next(error);
  }
});

router.post("/eigencompute/run", async (req, res, next) => {
  try {
    res.json(await eigencomputeService.runDecision(req.body));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
