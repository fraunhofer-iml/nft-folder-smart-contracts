/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.25;

import {ERC721Base} from './ERC721Base.sol';

abstract contract ERC721RemoteId is ERC721Base {
    struct RemoteIdData {
        uint256 tokenId;
        bool exists;
    }

    mapping(uint256 => string) private _tokenIdWithRemoteId;
    mapping(string => RemoteIdData) private _remoteIdWithData;

    error RemoteIdDoesNotExist();
    error RemoteIdAlreadyExist();

    function getRemoteId(uint256 tokenId) public view returns (string memory) {
        ensureTokenExists(tokenId);
        return _tokenIdWithRemoteId[tokenId];
    }

    function getTokenId(string memory remoteId) public view returns (uint256) {
        if (!_remoteIdWithData[remoteId].exists) revert RemoteIdDoesNotExist();
        return _remoteIdWithData[remoteId].tokenId;
    }

    function _setRemoteId(uint256 tokenId, string memory remoteId) internal {
        ensureTokenExists(tokenId);
        if (_remoteIdWithData[remoteId].exists) revert RemoteIdAlreadyExist();

        _tokenIdWithRemoteId[tokenId] = remoteId;
        _remoteIdWithData[remoteId] = RemoteIdData(tokenId, true);
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        if (to == address(0)) {
            // Remove the remote ID associated with the burned token
            string memory remoteId = _tokenIdWithRemoteId[tokenId];
            if (bytes(remoteId).length != 0) {
                delete _remoteIdWithData[remoteId];
                delete _tokenIdWithRemoteId[tokenId];
            }
        }
        return super._update(to, tokenId, auth);
    }
}
