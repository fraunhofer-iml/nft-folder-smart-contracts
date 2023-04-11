/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.16;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

abstract contract ERC721SegmentAllocation is ERC721, Ownable {
    struct SegmentLocationInToken {
        bool present;
        uint256 index;
    }

    // TODO-MP: can this be moved into _segmentContainsToken?
    // tokenId -> segment address
    mapping(uint256 => address[]) private _segments;

    // tokenId -> segment address -> id in _segments
    mapping(uint256 => mapping(address => SegmentLocationInToken)) private _segmentContainsToken;

    event SegmentAddedToToken(uint256 tokenId, address indexed segment, uint256 index);
    event SegmentRemovedFromToken(uint256 tokenId, address indexed segment, uint256 index);

    modifier onlySegment(address segment) {
        require(msg.sender == segment, "ERC721SegmentAllocation: can only be set from segment");
        _;
    }

    function addTokenToSegment(uint256 tokenId, address segmentAddress) external onlySegment(segmentAddress) {
        _requireMinted(tokenId);
        require(segmentAddress != address(0), "ERC721SegmentAllocation: segment is zero address");
        require(
            !_segmentContainsToken[tokenId][segmentAddress].present,
            "ERC721SegmentAllocation: token is already in segment."
        );

        _segments[tokenId].push(segmentAddress);

        uint256 indexOfTokenInSegments = _segments[tokenId].length - 1;
        _segmentContainsToken[tokenId][segmentAddress].index = indexOfTokenInSegments;
        _segmentContainsToken[tokenId][segmentAddress].present = true;

        emit SegmentAddedToToken(tokenId, segmentAddress, indexOfTokenInSegments);
    }

    function removeTokenFromSegment(uint256 tokenId, address segmentAddress) external onlySegment(segmentAddress) {
        require(segmentAddress != address(0), "ERC721SegmentAllocation: segment is zero address");
        require(
            _segmentContainsToken[tokenId][segmentAddress].present,
            "ERC721SegmentAllocation: token is not in segment."
        );

        uint256 indexFromElementToBeRemoved = _segmentContainsToken[tokenId][segmentAddress].index;
        delete _segmentContainsToken[tokenId][segmentAddress];

        // Override to be removed element with last element
        _segments[tokenId][indexFromElementToBeRemoved] = _segments[tokenId][_segments[tokenId].length - 1];
        _segments[tokenId].pop();

        // Update index of moved element, but only if it is not the last (already removed) element
        if (indexFromElementToBeRemoved < _segments[tokenId].length) {
            address movedSegmentAddress = _segments[tokenId][indexFromElementToBeRemoved];
            _segmentContainsToken[tokenId][movedSegmentAddress].index = indexFromElementToBeRemoved;
        }

        emit SegmentRemovedFromToken(tokenId, segmentAddress, indexFromElementToBeRemoved);
    }

    function getSegmentCountByToken(uint256 tokenId) external view returns (uint) {
        return _segments[tokenId].length;
    }

    function getSegmentForTokenAtSegmentIndex(uint256 tokenId, uint segmentIndex) external view returns (address) {
        require(segmentIndex < _segments[tokenId].length, "ERC721SegmentAllocation: no segment at given index");
        return _segments[tokenId][segmentIndex];
    }

    function getIndexForTokenAtSegment(uint256 tokenId, address segmentAddress) external view returns (uint256) {
        require(
            _segmentContainsToken[tokenId][segmentAddress].present,
            "ERC721SegmentAllocation: segment not in token"
        );
        return _segmentContainsToken[tokenId][segmentAddress].index;
    }

    // TODO-MP: we do have this function two times
    function isTokenInSegment(uint256 tokenId, address segmentAddress) external view returns (bool) {
        return _segmentContainsToken[tokenId][segmentAddress].present;
    }
}
