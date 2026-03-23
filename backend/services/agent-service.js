const { config } = require("../config");
const { resolveName } = require("./ens-service");
const locusService = require("./locus-service");
const veniceService = require("./venice-service");
const authorityService = require("./authority-service");
const erc8004Service = require("./erc8004-service");
const filecoinService = require("./filecoin-service");
const selfService = require("./self-service");
const eigencomputeService = require("./eigencompute-service");
const {
  appendAgentLog,
  appendConversation,
  paths,
  writeRuntime,
} = require("./log-service");

const safe = async (fn) => {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

async function planIntent({ intent, userId }) {
  const ensMatches = intent.match(/\b[a-z0-9-]+\.eth\b/gi) || [];
  const ensResolutions = [];
  for (const ensName of ensMatches) {
    ensResolutions.push(await safe(() => resolveName(ensName)));
  }

  const context = {
    userId: userId || null,
    selfSession: userId ? selfService.getSession(userId) : null,
    ensResolutions,
    locusBalance: await safe(() => locusService.getBalance()),
    baseAuthority: await safe(() => authorityService.getState("baseSepolia")),
    statusAuthority: await safe(() => authorityService.getState("statusSepolia")),
  };

  const decision = await veniceService.reasonIntent({ intent, context });

  appendConversation("human", intent);
  appendConversation("agent", JSON.stringify(decision));

  return { context, decision };
}

async function executeIntent({ intent, userId }) {
  const { context, decision } = await planIntent({ intent, userId });

  if (decision.requiresIdentity) {
    selfService.assertVerified(userId);
  }

  let execution;
  let executionError = null;

  try {
    if (decision.action === "resolve_ens") {
      execution = await resolveName(decision.target || intent);
    } else if (decision.action === "locus_transfer") {
      const resolvedTarget = await resolveName(decision.target);
      execution = await locusService.sendUsdc({
        toAddress: resolvedTarget.address,
        amount: decision.amount,
        memo: decision.memo || decision.reason,
      });
    } else if (decision.action === "onchain_transfer") {
      const resolvedTarget = await resolveName(decision.target);
      execution = await authorityService.execute({
        networkKey: "baseSepolia",
        target: resolvedTarget.address,
        amountEth: decision.amount,
        reason: decision.reason,
      });
    } else if (decision.action === "status_transfer") {
      const resolvedTarget = await resolveName(decision.target);
      execution = await authorityService.execute({
        networkKey: "statusSepolia",
        target: resolvedTarget.address,
        amountEth: decision.amount,
        reason: decision.reason,
      });
    } else if (decision.action === "register_identity") {
      const card = erc8004Service.buildAgentCard();
      execution = await erc8004Service.registerAgentIdentity({
        agentUri: card.ipfsUri || `file://${paths.agentCardPath}`,
      });
    } else if (decision.action === "upload_log") {
      execution = await filecoinService.uploadArtifact(paths.agentLogPath, {
        artifactType: "registration",
        agentId: config.erc8004.agentId || undefined,
      });
    } else {
      execution = {
        skipped: true,
        reason: decision.reason,
      };
    }
  } catch (error) {
    executionError = error;
    execution = {
      rejected: true,
      error: error.message,
      mode: config.mockMode ? "mock" : "live",
    };
  }

  const entry = appendAgentLog({
    step: "intent_execution",
    input: {
      intent,
      userId: userId || null,
    },
    decision,
    action: decision.action,
    txHash:
      execution.txHash ||
      execution?.data?.transaction?.tx_hash ||
      execution?.data?.tx_hash ||
      null,
    result: execution,
  });

  const teeDecision = await safe(() =>
    eigencomputeService.runDecision({
      intent,
      decision,
      evidenceEntryId: entry.recordedAt,
    })
  );

  writeRuntime("last-intent", {
    intent,
    decision,
    execution,
    teeDecision,
    context,
    updatedAt: new Date().toISOString(),
  });

  return {
    context,
    decision,
    execution,
    error: executionError ? executionError.message : null,
    teeDecision,
    logEntry: entry,
  };
}

module.exports = {
  planIntent,
  executeIntent,
};
