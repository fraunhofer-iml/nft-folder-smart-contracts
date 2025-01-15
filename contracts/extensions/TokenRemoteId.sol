/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

pragma solidity ^0.8.24;

import {TokenExtensionBase} from './TokenExtensionBase.sol';

abstract contract TokenRemoteId is TokenExtensionBase {
    mapping(uint256 tokenId => string remoteId) private _tokenIdWithRemoteId;
    mapping(string remoteId => uint256[] tokenIds) private _remoteIdWithTokenIds;
    mapping(address owner => uint256[] tokenIds) private _ownerWithTokenIds;

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

    // This function is called inside this contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
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
        _tokenIdWithRemoteId[tokenId] = remoteId;
        _remoteIdWithTokenIds[remoteId].push(tokenId);
    }

    // This function is called inside this contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
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

    // This function is called inside this contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
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
