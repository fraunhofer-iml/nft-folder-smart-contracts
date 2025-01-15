/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

pragma solidity ^0.8.24;

import {ERC721URIStorage} from '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

abstract contract TokenDataStorage is ERC721URIStorage {
    struct ResourceTuple {
        string uri;
        string hash;
    }

    struct TokenData {
        ResourceTuple asset;
        ResourceTuple metadata;
        string additionalData;
    }

    mapping(uint256 tokenId => TokenData TokenData) public tokenIdWithTokenData;

    event TokenUpdate(address indexed fromAddress, address indexed tokenAddress, uint256 indexed tokenId);

    function setAssetUri(uint256 tokenId, string memory uri) internal {
        tokenIdWithTokenData[tokenId].asset.uri = uri;

        emit TokenUpdate(msg.sender, address(this), tokenId);
    }

    function setAssetHash(uint256 tokenId, string memory hash) internal {
        tokenIdWithTokenData[tokenId].asset.hash = hash;

        emit TokenUpdate(msg.sender, address(this), tokenId);
    }

    function setMetadataUri(uint256 tokenId, string memory uri) internal {
        tokenIdWithTokenData[tokenId].metadata.uri = uri;
        super._setTokenURI(tokenId, uri);

        emit TokenUpdate(msg.sender, address(this), tokenId);
    }

    function setMetadataHash(uint256 tokenId, string memory hash) internal {
        tokenIdWithTokenData[tokenId].metadata.hash = hash;

        emit TokenUpdate(msg.sender, address(this), tokenId);
    }

    function setAdditionalData(uint256 tokenId, string memory additionalData) internal {
        // TODO-MP: it might be better to enforce a maximum length for additionalData
        tokenIdWithTokenData[tokenId].additionalData = additionalData;

        emit TokenUpdate(msg.sender, address(this), tokenId);
    }

    // This function is called by the implementing contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        if (
            to == address(0) &&
            bytes(tokenIdWithTokenData[tokenId].asset.uri).length != 0 &&
            bytes(tokenIdWithTokenData[tokenId].asset.hash).length != 0 &&
            bytes(tokenIdWithTokenData[tokenId].metadata.uri).length != 0 &&
            bytes(tokenIdWithTokenData[tokenId].metadata.hash).length != 0 &&
            bytes(tokenIdWithTokenData[tokenId].additionalData).length != 0
        ) {
            delete tokenIdWithTokenData[tokenId];
        }

        return super._update(to, tokenId, auth);
    }
}
