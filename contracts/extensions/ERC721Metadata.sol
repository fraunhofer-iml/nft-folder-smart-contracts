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

abstract contract ERC721Metadata is ERC721Base {
    mapping(uint256 => string) private _tokenIdWithMetadataHash;

    event MetadataUriSet(
        string oldMetadataUri,
        string newMetadataUri,
        address indexed from,
        address indexed tokenAddress,
        uint256 indexed tokenId
    );
    event MetadataHashSet(
        string oldMetadataHash,
        string newMetadataHash,
        address indexed from,
        address indexed tokenAddress,
        uint256 indexed tokenId
    );

    function setMetadataUri(uint256 tokenId, string memory metadataUri) public {
        ensureTokenExists(tokenId);

        string memory oldMetadataUri = super.tokenURI(tokenId);
        super._setTokenURI(tokenId, metadataUri);

        emit MetadataUriSet(oldMetadataUri, metadataUri, msg.sender, address(this), tokenId);
    }

    function setMetadataHash(uint256 tokenId, string memory metadataHash) public {
        ensureTokenExists(tokenId);

        string memory oldMetadataHash = _tokenIdWithMetadataHash[tokenId];
        _tokenIdWithMetadataHash[tokenId] = metadataHash;

        emit MetadataHashSet(oldMetadataHash, metadataHash, msg.sender, address(this), tokenId);
    }

    function getMetadataUri(uint256 tokenId) public view returns (string memory) {
        ensureTokenExists(tokenId);
        return super.tokenURI(tokenId);
    }

    function getMetadataHash(uint256 tokenId) public view returns (string memory) {
        ensureTokenExists(tokenId);
        return _tokenIdWithMetadataHash[tokenId];
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
