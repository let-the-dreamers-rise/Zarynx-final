// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract AuthorityManager is Ownable {
    address public agent;
    uint256 public maxSpend;
    bool public active;

    mapping(address => bool) public allowedTargets;
    address[] private allowedTargetList;

    event AuthorityConfigured(address indexed owner, address indexed agent, uint256 maxSpend, bool active);
    event TargetPermissionSet(address indexed target, bool allowed);
    event AuthorityRevoked(address indexed owner, address indexed agent);
    event ExecutionAttempt(
        address indexed agent,
        address indexed target,
        uint256 amount,
        bytes data,
        string reason,
        bytes32 indexed executionRef,
        bool success,
        bytes result
    );

    error NotAgent();
    error AuthorityInactive();
    error AmountExceedsLimit();
    error TargetNotAllowed();
    error EmptyAgent();
    error ExecutionFailed(bytes result);

    modifier onlyAgent() {
        if (msg.sender != agent) revert NotAgent();
        _;
    }

    constructor(address initialOwner, address initialAgent, uint256 initialMaxSpend, address[] memory initialTargets)
    {
        if (initialAgent == address(0)) revert EmptyAgent();
        _transferOwnership(initialOwner);
        agent = initialAgent;
        maxSpend = initialMaxSpend;
        active = true;

        for (uint256 i = 0; i < initialTargets.length; i++) {
            _setTarget(initialTargets[i], true);
        }

        emit AuthorityConfigured(initialOwner, initialAgent, initialMaxSpend, true);
    }

    receive() external payable {}

    function deposit() external payable {}

    function updateAuthority(address newAgent, uint256 newMaxSpend, bool newActive) external onlyOwner {
        if (newAgent == address(0)) revert EmptyAgent();
        agent = newAgent;
        maxSpend = newMaxSpend;
        active = newActive;

        emit AuthorityConfigured(owner(), newAgent, newMaxSpend, newActive);
    }

    function setTarget(address target, bool allowed) external onlyOwner {
        _setTarget(target, allowed);
    }

    function setTargets(address[] calldata targets, bool allowed) external onlyOwner {
        for (uint256 i = 0; i < targets.length; i++) {
            _setTarget(targets[i], allowed);
        }
    }

    function revoke() external onlyOwner {
        active = false;
        emit AuthorityRevoked(owner(), agent);
    }

    function reactivate() external onlyOwner {
        active = true;
        emit AuthorityConfigured(owner(), agent, maxSpend, true);
    }

    function getAllowedTargets() external view returns (address[] memory) {
        return allowedTargetList;
    }

    function execute(address payable target, uint256 amount, bytes calldata data, string calldata reason, bytes32 executionRef)
        external
        onlyAgent
        returns (bytes memory)
    {
        if (!active) revert AuthorityInactive();
        if (amount > maxSpend) revert AmountExceedsLimit();
        if (!allowedTargets[target]) revert TargetNotAllowed();

        (bool success, bytes memory result) = target.call{value: amount}(data);

        emit ExecutionAttempt(msg.sender, target, amount, data, reason, executionRef, success, result);

        if (!success) revert ExecutionFailed(result);

        return result;
    }

    function _setTarget(address target, bool allowed) internal {
        bool exists = allowedTargets[target];
        allowedTargets[target] = allowed;

        if (allowed && !exists) {
            allowedTargetList.push(target);
        }

        if (!allowed && exists) {
            uint256 length = allowedTargetList.length;
            for (uint256 i = 0; i < length; i++) {
                if (allowedTargetList[i] == target) {
                    allowedTargetList[i] = allowedTargetList[length - 1];
                    allowedTargetList.pop();
                    break;
                }
            }
        }

        emit TargetPermissionSet(target, allowed);
    }
}
