/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.18;

import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {ErrorDefinitions} from './ErrorDefinitions.sol';

abstract contract ERC721RemoteId is ERC721, ErrorDefinitions {
    struct RemoteIdData {
        uint256 tokenId;
        bool exists;
    }

    mapping(uint256 => string) private _tokenIdWithRemoteId;
    mapping(string => RemoteIdData) private _remoteIdWithData;

    error RemoteIdDoesNotExist();
    error RemoteIdAlreadyExist();

    function getRemoteId(uint256 tokenId) public view returns (string memory) {
        if (!_exists(tokenId)) revert TokenIdDoesNotExist();
        return _tokenIdWithRemoteId[tokenId];
    }

    function getTokenId(string memory remoteId) public view returns (uint256) {
        if (!_remoteIdWithData[remoteId].exists) revert RemoteIdDoesNotExist();
        return _remoteIdWithData[remoteId].tokenId;
    }

    function _setRemoteId(uint256 tokenId, string memory remoteId) internal {
        if (!_exists(tokenId)) revert TokenIdDoesNotExist();
        if (_remoteIdWithData[remoteId].exists) revert RemoteIdAlreadyExist();

        _tokenIdWithRemoteId[tokenId] = remoteId;
        _remoteIdWithData[remoteId] = RemoteIdData(tokenId, true);
    }

    function _burn(uint256 tokenId) internal virtual override {
        super._burn(tokenId);

        // Remove the remote ID associated with the burned token
        string memory remoteId = _tokenIdWithRemoteId[tokenId];
        if (bytes(remoteId).length != 0) {
            delete _remoteIdWithData[remoteId];
            delete _tokenIdWithRemoteId[tokenId];
        }
    }
}
