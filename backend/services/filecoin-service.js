const { execFile } = require("child_process");
const { promisify } = require("util");
const { config } = require("../config");
const { isMockMode } = require("./mode-service");
const mockService = require("./mock-service");

const execFileAsync = promisify(execFile);

const baseArgs = () => {
  if (!config.filecoin.privateKey) {
    throw new Error("FILECOIN_PRIVATE_KEY is not configured");
  }

  return [
    "--yes",
    config.filecoin.pinPackage,
  ];
};

const parseUploadOutput = (stdout) => {
  const cidMatch = stdout.match(/CID[:\s]+([a-zA-Z0-9]+)/i);
  const dataSetIdMatch = stdout.match(/Data\s*Set\s*ID[:\s]+([a-zA-Z0-9-]+)/i);
  return {
    cid: cidMatch ? cidMatch[1] : null,
    dataSetId: dataSetIdMatch ? dataSetIdMatch[1] : null,
    raw: stdout.trim(),
  };
};

async function uploadArtifact(filePath, options = {}) {
  if (isMockMode()) {
    return mockService.uploadArtifact(filePath, options);
  }

  const args = [
    ...baseArgs(),
    "add",
    filePath,
    "--private-key",
    config.filecoin.privateKey,
    "--network",
    config.filecoin.network,
    "--auto-fund",
  ];

  if (options.agentId) {
    args.push("--8004-agent", String(options.agentId));
  }
  if (options.artifactType) {
    args.push("--8004-type", options.artifactType);
  }

  const { stdout, stderr } = await execFileAsync(config.filecoin.pinBin, args, {
    cwd: config.rootDir,
    timeout: 600000,
    env: {
      ...process.env,
      PRIVATE_KEY: config.filecoin.privateKey,
      NETWORK: config.filecoin.network,
      FILECOIN_PIN_TELEMETRY_DISABLED: "true",
    },
    maxBuffer: 1024 * 1024 * 10,
  });

  return {
    ...parseUploadOutput(stdout),
    stderr: stderr.trim(),
  };
}

module.exports = {
  uploadArtifact,
};
