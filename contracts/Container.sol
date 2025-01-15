/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

pragma solidity ^0.8.24;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {Segment} from './Segment.sol';

contract Container is Ownable {
    string private _name;
    address[] private _segmentAddresses;
    mapping(address => bool) private _segmentAddressExists;

    event SegmentAdded(address indexed from, address indexed segmentAddress);

    error ContainerNameIsEmpty();
    error NoSegmentsAvailable();
    error IndexExceedsSegmentLength();

    constructor(address owner, string memory name) Ownable(owner) {
        if (bytes(name).length <= 0) {
            revert ContainerNameIsEmpty();
        }

        _name = name;
    }

    // TODO-MP: maybe a factory contract would be better
    function createSegment(string memory name) external onlyOwner {
        if (bytes(name).length <= 0) {
            revert ContainerNameIsEmpty();
        }

        // TODO-MP: add precondition -> name should not exist

        Segment segmentContract = new Segment(owner(), name, address(this));
        address segmentAddress = address(segmentContract);

        _segmentAddresses.push(segmentAddress);
        _segmentAddressExists[segmentAddress] = true;

        emit SegmentAdded(msg.sender, segmentAddress);
    }

    function getName() external view returns (string memory) {
        return _name;
    }

    function getAllSegments() external view returns (address[] memory) {
        return _segmentAddresses;
    }

    function getSegment(uint256 index) external view returns (address) {
        if (_segmentAddresses.length <= 0) {
            revert NoSegmentsAvailable();
        }

        if (index >= _segmentAddresses.length) {
            revert IndexExceedsSegmentLength();
        }

        return _segmentAddresses[index];
    }

    function getNumberOfSegments() external view returns (uint256) {
        return _segmentAddresses.length;
    }

    function isSegmentInContainer(address segmentAddress) external view returns (bool) {
        return _segmentAddressExists[segmentAddress];
    }
}
