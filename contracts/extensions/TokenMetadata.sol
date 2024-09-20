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

abstract contract TokenMetadata is TokenExtensionBase {
    struct Metadata {
        string uri;
        string hash;
    }

    mapping(uint256 => string) private _tokenIdWithMetadataHash; // The uri is stored in the base ERC721 contract

    event MetadataUriSet(
        string oldUri,
        string newUri,
        address indexed from,
        address indexed tokenAddress,
        uint256 indexed tokenId
    );
    event MetadataHashSet(
        string oldHash,
        string newHash,
        address indexed from,
        address indexed tokenAddress,
        uint256 indexed tokenId
    );

    function setMetadataUri(uint256 tokenId, string memory uri) public {
        ensureTokenExists(tokenId);

        string memory oldUri = super.tokenURI(tokenId);
        super._setTokenURI(tokenId, uri);

        emit MetadataUriSet(oldUri, uri, msg.sender, address(this), tokenId);
    }

    function setMetadataHash(uint256 tokenId, string memory hash) public {
        ensureTokenExists(tokenId);

        string memory oldHash = _tokenIdWithMetadataHash[tokenId];
        _tokenIdWithMetadataHash[tokenId] = hash;

        emit MetadataHashSet(oldHash, hash, msg.sender, address(this), tokenId);
    }

    function getMetadata(uint256 tokenId) public view returns (Metadata memory) {
        ensureTokenExists(tokenId);

        return Metadata({uri: super.tokenURI(tokenId), hash: _tokenIdWithMetadataHash[tokenId]});
    }

    // This function is called by the implementing contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        if (to == address(0) && bytes(_tokenIdWithMetadataHash[tokenId]).length != 0) {
            delete _tokenIdWithMetadataHash[tokenId];
        }

        return super._update(to, tokenId, auth);
    }
}
