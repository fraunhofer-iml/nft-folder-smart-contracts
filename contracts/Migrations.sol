/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.16;

contract Migrations {
    address public immutable owner = msg.sender;
    uint256 public lastCompletedMigration;

    modifier onlyOwner() {
        require(msg.sender == owner, "This function is restricted to the contract's owner");
        _;
    }

    function setCompleted(uint256 completed) external onlyOwner {
        lastCompletedMigration = completed;
    }
}
