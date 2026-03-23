// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract AgentIdentityRegistry is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    event AgentRegistered(uint256 indexed agentId, address indexed operator, address indexed owner, string agentUri);
    event AgentMetadataUpdated(uint256 indexed agentId, string agentUri);

    constructor(address initialOwner) ERC721("ZARYNX Agent Identity", "ZAI") {
        _transferOwnership(initialOwner);
    }

    function registerAgent(address to, string calldata agentUri) external onlyOwner returns (uint256 agentId) {
        agentId = ++nextTokenId;
        _safeMint(to, agentId);
        _setTokenURI(agentId, agentUri);

        emit AgentRegistered(agentId, msg.sender, to, agentUri);
    }

    function updateAgentUri(uint256 agentId, string calldata agentUri) external {
        require(_isApprovedOrOwner(msg.sender, agentId), "NOT_AUTHORIZED");
        _setTokenURI(agentId, agentUri);
        emit AgentMetadataUpdated(agentId, agentUri);
    }
}
