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

abstract contract ERC721AssetStorage is ERC721 {
    mapping(uint256 => string) private _assetUris; // TODO-MP: combine both into a struct
    mapping(uint256 => string) private _assetHashes;

    function getAssetUri(uint256 tokenId) public view virtual returns (string memory) {
        _requireMinted(tokenId);
        return _assetUris[tokenId];
    }

    function getAssetHash(uint256 tokenId) public view virtual returns (string memory) {
        _requireMinted(tokenId);
        return _assetHashes[tokenId];
    }

    function _setAsset(uint256 tokenId, string memory assetUri, string memory assetHash) internal virtual {
        require(_exists(tokenId), "ERC721AssetURIStorage: URI set of nonexistent token");
        _assetUris[tokenId] = assetUri;
        _assetHashes[tokenId] = assetHash;
    }

    // This function is called by the implementing contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
    function _burn(uint256 tokenId) internal virtual override {
        super._burn(tokenId);

        if (bytes(_assetUris[tokenId]).length != 0) {
            delete _assetUris[tokenId];
        }

        if (bytes(_assetHashes[tokenId]).length != 0) {
            delete _assetHashes[tokenId];
        }
    }
}
