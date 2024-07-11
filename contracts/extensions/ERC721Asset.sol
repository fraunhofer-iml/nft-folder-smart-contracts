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

abstract contract ERC721Asset is ERC721Base {
    struct AssetInformation {
        string assetUri;
        string assetHash;
    }

    mapping(uint256 => AssetInformation) private _tokenIdWithAssetInformation;
    event AssetUriSet(
        string oldAssetUri,
        string newAssetUri,
        address indexed from,
        address indexed tokenAddress,
        uint256 indexed tokenId
    );
    event AssetHashSet(
        string oldAssetHash,
        string newAssetHash,
        address indexed from,
        address indexed tokenAddress,
        uint256 indexed tokenId
    );

    function setAssetUri(uint256 tokenId, string memory assetUri) public {
        ensureTokenExists(tokenId);

        string memory oldAssetUri = _tokenIdWithAssetInformation[tokenId].assetUri;
        _tokenIdWithAssetInformation[tokenId].assetUri = assetUri;

        emit AssetUriSet(oldAssetUri, assetUri, msg.sender, address(this), tokenId);
    }

    function setAssetHash(uint256 tokenId, string memory assetHash) public {
        ensureTokenExists(tokenId);

        string memory oldAssetHash = _tokenIdWithAssetInformation[tokenId].assetHash;
        _tokenIdWithAssetInformation[tokenId].assetHash = assetHash;

        emit AssetHashSet(oldAssetHash, assetHash, msg.sender, address(this), tokenId);
    }

    function getAssetInformation(uint256 tokenId) public view returns (AssetInformation memory) {
        ensureTokenExists(tokenId);
        return _tokenIdWithAssetInformation[tokenId];
    }

    function getAssetUri(uint256 tokenId) public view returns (string memory) {
        ensureTokenExists(tokenId);
        return _tokenIdWithAssetInformation[tokenId].assetUri;
    }

    function getAssetHash(uint256 tokenId) public view returns (string memory) {
        ensureTokenExists(tokenId);
        return _tokenIdWithAssetInformation[tokenId].assetHash;
    }

    // This function is called by the implementing contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        if (
            to == address(0) &&
            bytes(_tokenIdWithAssetInformation[tokenId].assetUri).length != 0 &&
            bytes(_tokenIdWithAssetInformation[tokenId].assetHash).length != 0
        ) {
            delete _tokenIdWithAssetInformation[tokenId];
        }
        return super._update(to, tokenId, auth);
    }
}
