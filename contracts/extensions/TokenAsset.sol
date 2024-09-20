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

abstract contract TokenAsset is TokenExtensionBase {
    struct Asset {
        string uri;
        string hash;
    }

    mapping(uint256 => Asset) private _tokenIdWithAsset;

    event AssetUriSet(
        string oldUri,
        string newUri,
        address indexed from,
        address indexed tokenAddress,
        uint256 indexed tokenId
    );
    event AssetHashSet(
        string oldHash,
        string newHash,
        address indexed from,
        address indexed tokenAddress,
        uint256 indexed tokenId
    );

    function setAssetUri(uint256 tokenId, string memory uri) public {
        ensureTokenExists(tokenId);

        string memory oldUri = _tokenIdWithAsset[tokenId].uri;
        _tokenIdWithAsset[tokenId].uri = uri;

        emit AssetUriSet(oldUri, uri, msg.sender, address(this), tokenId);
    }

    function setAssetHash(uint256 tokenId, string memory hash) public {
        ensureTokenExists(tokenId);

        string memory oldHash = _tokenIdWithAsset[tokenId].hash;
        _tokenIdWithAsset[tokenId].hash = hash;

        emit AssetHashSet(oldHash, hash, msg.sender, address(this), tokenId);
    }

    function getAsset(uint256 tokenId) public view returns (Asset memory) {
        ensureTokenExists(tokenId);
        return _tokenIdWithAsset[tokenId];
    }

    // This function is called by the implementing contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        if (
            to == address(0) &&
            bytes(_tokenIdWithAsset[tokenId].uri).length != 0 &&
            bytes(_tokenIdWithAsset[tokenId].hash).length != 0
        ) {
            delete _tokenIdWithAsset[tokenId];
        }

        return super._update(to, tokenId, auth);
    }
}
