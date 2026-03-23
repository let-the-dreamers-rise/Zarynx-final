const fs = require("fs");
const path = require("path");
const { config } = require("../config");

const runtimeDir = path.join(config.rootDir, "backend", "data", "runtime");
const agentLogPath = path.join(config.rootDir, "agent_log.json");
const agentCardPath = path.join(config.rootDir, "agent.json");
const conversationPath = path.join(config.rootDir, "conversation.txt");

const ensureDir = (targetPath) => {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
};

const ensureJsonFile = (filePath, initialValue) => {
  ensureDir(filePath);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialValue, null, 2), "utf8");
  }
};

const readJson = (filePath, initialValue) => {
  ensureJsonFile(filePath, initialValue);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

const writeJson = (filePath, value) => {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
};

const appendAgentLog = (entry) => {
  const current = readJson(agentLogPath, { protocol: "ZARYNX-VAAP", updatedAt: null, entries: [] });
  current.updatedAt = new Date().toISOString();
  current.entries.push({
    ...entry,
    recordedAt: new Date().toISOString(),
  });
  writeJson(agentLogPath, current);
  return current.entries[current.entries.length - 1];
};

const readAgentLog = () => readJson(agentLogPath, { protocol: "ZARYNX-VAAP", updatedAt: null, entries: [] });

const writeAgentCard = (card) => {
  writeJson(agentCardPath, card);
  return card;
};

const readAgentCard = () => readJson(agentCardPath, {});

const appendConversation = (speaker, message) => {
  ensureDir(conversationPath);
  const stamp = new Date().toISOString();
  const line = `[${stamp}] ${speaker}: ${message}\n`;
  fs.appendFileSync(conversationPath, line, "utf8");
  return line;
};

const readConversation = () => {
  if (!fs.existsSync(conversationPath)) {
    return "";
  }
  return fs.readFileSync(conversationPath, "utf8");
};

const runtimePath = (name) => path.join(runtimeDir, `${name}.runtime.json`);

const writeRuntime = (name, value) => {
  const target = runtimePath(name);
  writeJson(target, value);
  return value;
};

const readRuntime = (name, initialValue = {}) => readJson(runtimePath(name), initialValue);

module.exports = {
  appendAgentLog,
  appendConversation,
  readAgentCard,
  readAgentLog,
  readConversation,
  readRuntime,
  writeAgentCard,
  writeRuntime,
  paths: {
    agentLogPath,
    agentCardPath,
    conversationPath,
    runtimeDir,
  },
};
