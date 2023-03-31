/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.16;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Segment} from "./Segment.sol";

contract Container is Ownable {
    string private _name;
    address[] private _segments;
    mapping(address => bool) private _segmentInContainer;

    event SegmentAdded(address indexed from, address indexed segment, uint256 index);

    constructor(address owner, string memory name) {
        require(owner != address(0), "Container: owner is zero address");
        require(bytes(name).length > 0, "Container: name must contain characters");

        _transferOwnership(owner);
        _name = name;
    }

    // TODO-MP: maybe a factory contract would be better
    function createSegment(string memory name) external onlyOwner {
        require(bytes(name).length > 0, "Container: name is empty");

        Segment segmentContract = new Segment(owner(), name, address(this));
        address segmentAddress = address(segmentContract);

        _segments.push(segmentAddress);
        _segmentInContainer[segmentAddress] = true;

        emit SegmentAdded(msg.sender, segmentAddress, _segments.length - 1);
    }

    function getName() external view returns (string memory) {
        return _name;
    }

    function getSegmentCount() external view returns (uint) {
        return _segments.length;
    }

    function getSegmentAtIndex(uint index) external view returns (address) {
        require(_segments.length > 0, "Container: no segments stored in container");
        require(index < _segments.length, "Container: index is too big");

        return _segments[index];
    }

    function isSegmentInContainer(address segment) external view returns (bool) {
        return _segmentInContainer[segment];
    }
}
