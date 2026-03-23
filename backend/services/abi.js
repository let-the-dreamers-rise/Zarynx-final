const authorityManagerAbi = [
  "function owner() view returns (address)",
  "function agent() view returns (address)",
  "function maxSpend() view returns (uint256)",
  "function active() view returns (bool)",
  "function allowedTargets(address) view returns (bool)",
  "function getAllowedTargets() view returns (address[])",
  "function updateAuthority(address newAgent, uint256 newMaxSpend, bool newActive)",
  "function setTarget(address target, bool allowed)",
  "function revoke()",
  "function reactivate()",
  "function execute(address target, uint256 amount, bytes data, string reason, bytes32 executionRef) returns (bytes)",
  "event ExecutionAttempt(address indexed agent, address indexed target, uint256 amount, bytes data, string reason, bytes32 indexed executionRef, bool success, bytes result)"
];

const agentIdentityRegistryAbi = [
  "function nextTokenId() view returns (uint256)",
  "function registerAgent(address to, string agentUri) returns (uint256)",
  "function updateAgentUri(uint256 agentId, string agentUri)",
  "function tokenURI(uint256 agentId) view returns (string)",
  "event AgentRegistered(uint256 indexed agentId, address indexed operator, address indexed owner, string agentUri)",
  "event AgentMetadataUpdated(uint256 indexed agentId, string agentUri)"
];

module.exports = {
  authorityManagerAbi,
  agentIdentityRegistryAbi,
};
