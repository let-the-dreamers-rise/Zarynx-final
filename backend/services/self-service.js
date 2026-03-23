const crypto = require("crypto");
const { DefaultConfigStore, SelfBackendVerifier, countries } = require("@selfxyz/core");
const { config } = require("../config");
const { readRuntime, writeRuntime } = require("./log-service");
const { isMockMode } = require("./mode-service");

const SESSIONS_KEY = "self-sessions";

const configStore = new DefaultConfigStore({
  minimumAge: 18,
  excludedCountries: [countries.IRAN, countries.NORTH_KOREA, countries.SYRIA],
  ofac: true,
});

const verifier = () => {
  if (!config.self.scope || !config.self.endpoint) {
    throw new Error("SELF_SCOPE and SELF_ENDPOINT must be configured");
  }

  return new SelfBackendVerifier(
    config.self.scope,
    config.self.endpoint,
    config.self.devMode,
    new Map([[1, true]]),
    configStore,
    "uuid"
  );
};

const readSessions = () => readRuntime(SESSIONS_KEY, { sessions: [] });

const upsertSession = (session) => {
  const current = readSessions();
  const index = current.sessions.findIndex((item) => item.userId === session.userId);
  if (index >= 0) {
    current.sessions[index] = { ...current.sessions[index], ...session };
  } else {
    current.sessions.push(session);
  }
  writeRuntime(SESSIONS_KEY, current);
  return session;
};

function createSession() {
  const userId = crypto.randomUUID();
  const session = {
    userId,
    status: isMockMode() ? "verified" : "pending",
    createdAt: new Date().toISOString(),
    ...(isMockMode()
      ? {
          verifiedAt: new Date().toISOString(),
          result: {
            verificationMethod: "accelerated-preview",
            scope: config.self.scope || "zarynx-preview-scope",
            endpoint: config.self.endpoint || `${config.backendUrl}/api/self/verify`,
          },
        }
      : {}),
  };
  upsertSession(session);
  return session;
}

async function verifyProof(payload) {
  if (isMockMode()) {
    const next = {
      userId: payload.userId || crypto.randomUUID(),
      status: "verified",
      verifiedAt: new Date().toISOString(),
      result: {
        verificationMethod: "accelerated-preview",
        attestationId: payload.attestationId || `attestation-${crypto.randomUUID()}`,
        proofAccepted: true,
      },
    };
    upsertSession(next);
    return next;
  }

  const session = payload.userId ? getSession(payload.userId) : null;
  const result = await verifier().verify(
    payload.attestationId,
    payload.proof,
    payload.publicSignals,
    payload.userContextData
  );

  const next = {
    userId: payload.userId || result.userData.userIdentifier,
    status: result.isValidDetails.isValid ? "verified" : "rejected",
    verifiedAt: new Date().toISOString(),
    result,
  };

  upsertSession({
    ...(session || {}),
    ...next,
  });

  return next;
}

function getSession(userId) {
  const current = readSessions();
  return current.sessions.find((session) => session.userId === userId) || null;
}

function assertVerified(userId) {
  if (isMockMode() && !userId) {
    return {
      userId: "self-preview-session",
      status: "verified",
      verifiedAt: new Date().toISOString(),
      result: {
        verificationMethod: "accelerated-preview",
      },
    };
  }
  const session = getSession(userId);
  if (!session || session.status !== "verified") {
    throw new Error("Self identity verification is required before execution");
  }
  return session;
}

module.exports = {
  createSession,
  verifyProof,
  getSession,
  assertVerified,
};
