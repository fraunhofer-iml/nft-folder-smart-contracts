/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.18;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Segment} from "../Segment.sol";

abstract contract ERC721SegmentAllocation is ERC721, Ownable {
    mapping(uint256 => address[]) private _tokenIdWithSegmentAddresses;

    event SegmentAddedToToken(uint256 tokenId, address indexed segment);
    event SegmentRemovedFromToken(uint256 tokenId, address indexed segment);

    modifier onlySegment(address segmentAddress) {
        require(msg.sender == segmentAddress, "ERC721SegmentAllocation: can only be set from segment");
        _;
    }

    function addTokenToSegment(uint256 tokenId, address segmentAddress) external onlySegment(segmentAddress) {
        _requireMinted(tokenId);
        require(segmentAddress != address(0), "ERC721SegmentAllocation: segment is zero address");
        require(!isTokenInSegment(tokenId, segmentAddress), "ERC721SegmentAllocation: token is already in segment");

        _tokenIdWithSegmentAddresses[tokenId].push(segmentAddress);

        emit SegmentAddedToToken(tokenId, segmentAddress);
    }

    function removeTokenFromSegment(uint256 tokenId, address segmentAddress) external onlySegment(segmentAddress) {
        require(segmentAddress != address(0), "ERC721SegmentAllocation: segment is zero address");
        require(isTokenInSegment(tokenId, segmentAddress), "ERC721SegmentAllocation: token is not in segment");

        for (uint256 i = 0; i < _tokenIdWithSegmentAddresses[tokenId].length; i++) {
            if (_tokenIdWithSegmentAddresses[tokenId][i] == segmentAddress) {
                uint256 lastIndex = _tokenIdWithSegmentAddresses[tokenId].length - 1;
                _tokenIdWithSegmentAddresses[tokenId][i] = _tokenIdWithSegmentAddresses[tokenId][lastIndex];
                _tokenIdWithSegmentAddresses[tokenId].pop();
                break;
            }
        }

        emit SegmentRemovedFromToken(tokenId, segmentAddress);
    }

    function getAllSegments(uint256 tokenId) external view returns (address[] memory) {
        return _tokenIdWithSegmentAddresses[tokenId];
    }

    function getSegment(uint256 tokenId, uint256 segmentAddressIndex) external view returns (address) {
        require(
            segmentAddressIndex < _tokenIdWithSegmentAddresses[tokenId].length,
            "ERC721SegmentAllocation: no segment at given index"
        );
        return _tokenIdWithSegmentAddresses[tokenId][segmentAddressIndex];
    }

    function getNumberOfSegments(uint256 tokenId) external view returns (uint256) {
        return _tokenIdWithSegmentAddresses[tokenId].length;
    }

    function isTokenInSegment(uint256 tokenId, address segmentAddress) public view returns (bool) {
        for (uint256 i = 0; i < _tokenIdWithSegmentAddresses[tokenId].length; i++) {
            if (_tokenIdWithSegmentAddresses[tokenId][i] == segmentAddress) {
                return true;
            }
        }
        return false;
    }

    // This function is called by the implementing contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
    function _burn(uint256 tokenId) internal virtual override {
        super._burn(tokenId);

        address[] memory segmentAddresses = _tokenIdWithSegmentAddresses[tokenId];

        for (uint256 i = 0; i < segmentAddresses.length; i++) {
            Segment segmentContract = Segment(segmentAddresses[i]);
            segmentContract.removeToken(address(this), tokenId);
        }
    }
}
