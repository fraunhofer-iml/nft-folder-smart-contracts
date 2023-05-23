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

abstract contract ERC721RemoteId is ERC721 {
    mapping(uint256 => string) private _tokenIdWithRemoteId;
    mapping(string => uint256) private _remoteIdWithTokenId;

    function getRemoteId(uint256 tokenId) public view virtual returns (string memory) {
        require(_exists(tokenId), "ERC721RemoteId: token does not exist");
        return _tokenIdWithRemoteId[tokenId];
    }

    function getTokenId(string memory remoteId) public view virtual returns (uint256) {
        uint256 tokenId = _remoteIdWithTokenId[remoteId];
        require(_exists(tokenId), "ERC721RemoteId: token does not exist");
        return tokenId;
    }

    function _setRemoteId(uint256 tokenId, string memory remoteId) internal virtual {
        require(_exists(tokenId), "ERC721RemoteId: token does not exist");
        _tokenIdWithRemoteId[tokenId] = remoteId;
        _remoteIdWithTokenId[remoteId] = tokenId;
    }

    // This function is called by the implementing contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
    function _burn(uint256 tokenId) internal virtual override {
        super._burn(tokenId);

        if (bytes(_tokenIdWithRemoteId[tokenId]).length != 0) {
            string memory remoteId = _tokenIdWithRemoteId[tokenId];
            delete _remoteIdWithTokenId[remoteId];
            delete _tokenIdWithRemoteId[tokenId];
        }
    }
}
