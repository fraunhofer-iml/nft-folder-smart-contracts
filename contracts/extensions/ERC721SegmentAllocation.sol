/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.24;

import {ERC721Base} from './ERC721Base.sol';
import {Segment} from '../Segment.sol';

abstract contract ERC721SegmentAllocation is ERC721Base {
    mapping(uint256 => address[]) private _tokenIdWithSegmentAddresses;
    string private constant ERROR_MESSAGE = 'ERC721SegmentAllocation: token does not exist';

    event SegmentAddedToToken(uint256 tokenId, address indexed segment);
    event SegmentRemovedFromToken(uint256 tokenId, address indexed segment);

    error SenderIsNotSegment();
    error TokenExistsInSegment();
    error TokenDoesNotExistInSegment();
    error IndexExceedsSegmentLengthForToken();

    modifier onlySegment(address segmentAddress) {
        if (msg.sender != segmentAddress) {
            revert SenderIsNotSegment();
        }
        _;
    }

    function addTokenToSegment(uint256 tokenId, address segmentAddress) external onlySegment(segmentAddress) {
        ensureTokenExists(tokenId);

        if (isTokenInSegment(tokenId, segmentAddress)) {
            revert TokenExistsInSegment();
        }

        _tokenIdWithSegmentAddresses[tokenId].push(segmentAddress);

        emit SegmentAddedToToken(tokenId, segmentAddress);
    }

    function removeTokenFromSegment(uint256 tokenId, address segmentAddress) external onlySegment(segmentAddress) {
        ensureTokenExists(tokenId);

        if (!isTokenInSegment(tokenId, segmentAddress)) {
            revert TokenDoesNotExistInSegment();
        }

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
        if (segmentAddressIndex >= _tokenIdWithSegmentAddresses[tokenId].length) {
            revert IndexExceedsSegmentLengthForToken();
        }

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
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        if (to == address(0)) {
            address[] memory segmentAddresses = _tokenIdWithSegmentAddresses[tokenId];

            for (uint256 i = 0; i < segmentAddresses.length; i++) {
                Segment segmentContract = Segment(segmentAddresses[i]);
                segmentContract.removeToken(address(this), tokenId);
            }
        }

        return super._update(to, tokenId, auth);
    }
}
