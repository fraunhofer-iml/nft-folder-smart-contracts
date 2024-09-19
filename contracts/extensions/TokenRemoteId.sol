/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.24;

import {TokenExtensionBase} from './TokenExtensionBase.sol';

abstract contract TokenRemoteId is TokenExtensionBase {
    mapping(uint256 => string) private _tokenIdWithRemoteId;
    mapping(string => uint256[]) private _remoteIdWithTokenIds;
    mapping(address => uint256[]) private _ownerWithTokenIds;

    error RemoteIdDoesNotExist();

    function getRemoteIdByTokenId(uint256 tokenId) public view returns (string memory) {
        ensureTokenExists(tokenId);

        return _tokenIdWithRemoteId[tokenId];
    }

    function getTokenIdsByRemoteId(string memory remoteId) public view returns (uint256[] memory) {
        return _remoteIdWithTokenIds[remoteId];
    }

    function getTokenIdsByOwner(address owner) public view returns (uint256[] memory) {
        return _ownerWithTokenIds[owner];
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        if (to == address(0)) {
            // burn token
            string memory remoteId = _tokenIdWithRemoteId[tokenId];

            if (bytes(remoteId).length != 0) {
                _dissociateRemoteIdFromTokenId(tokenId, remoteId);
                _dissociateOwnerFromToken(tokenId, auth);
            }
        } else {
            // mint or transfer token
            _dissociateOwnerFromToken(tokenId, auth);
            _ownerWithTokenIds[to].push(tokenId);
        }

        return super._update(to, tokenId, auth);
    }

    function _associateRemoteIdWithTokenId(uint256 tokenId, string memory remoteId) internal {
        ensureTokenExists(tokenId);

        _tokenIdWithRemoteId[tokenId] = remoteId;
        _remoteIdWithTokenIds[remoteId].push(tokenId);
    }

    function _dissociateRemoteIdFromTokenId(uint256 tokenId, string memory remoteId) internal {
        uint256[] memory tokenIds = _remoteIdWithTokenIds[remoteId];

        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i] == tokenId) {
                _remoteIdWithTokenIds[remoteId][i] = tokenIds[tokenIds.length - 1];
                _remoteIdWithTokenIds[remoteId].pop();
                break;
            }
        }

        delete _tokenIdWithRemoteId[tokenId];
    }

    function _dissociateOwnerFromToken(uint256 tokenId, address owner) internal {
        uint256[] memory tokenIds = _ownerWithTokenIds[owner];

        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i] == tokenId) {
                _ownerWithTokenIds[owner][i] = tokenIds[tokenIds.length - 1];
                _ownerWithTokenIds[owner].pop();
                break;
            }
        }
    }
}
