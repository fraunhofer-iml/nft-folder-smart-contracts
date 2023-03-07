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
import {TestSegment} from "./TestSegment.sol";

contract Container is Ownable {
    string private _name;
    address[] private _segments;
    mapping(address => bool) private _segmentInContainer;

    event SegmentAdded(address indexed from, address indexed segment, uint256 index);
    event SegmentRemoved(address indexed from, address indexed segment, uint256 index);

    constructor(address owner, string memory name) {
        require(owner != address(0), "Container: new owner is the zero address");
        require(bytes(name).length > 0, "Container: Name must contain characters");
        _transferOwnership(owner);
        _name = name;
    }

    function getSegmentCount() external view returns (uint) {
        return _segments.length;
    }

    function getSegmentAtIndex(uint index) external view returns (address) {
        return _segments[index];
    }

    function isSegmentInContainer(address segment) external view returns (bool) {
        return _segmentInContainer[segment];
    }

    function addSegment(address segment) public onlyOwner {
        require(!_segmentInContainer[segment], "Container: Segment is already in Container.");
        _segments.push(segment);
        _segmentInContainer[segment] = true;
        emit SegmentAdded(msg.sender, segment, _segments.length - 1);
    }

    function addNewSegment(string memory name) public onlyOwner {
        TestSegment segment = new TestSegment(name);
        addSegment(address(segment));
    }

    function removeSegment(uint index) public onlyOwner {
        require(index < _segments.length, "Container: Invalid index to remove segment");
        address segmentAddress = _segments[index];
        _segmentInContainer[segmentAddress] = false;
        _segments[index] = _segments[_segments.length - 1];
        _segments.pop();
        emit SegmentRemoved(msg.sender, segmentAddress, index);
    }
}
