/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

pragma solidity ^0.8.24;

import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {TokenDataStorage} from './extensions/TokenDataStorage.sol';
import {ERC721Burnable} from '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol';
import {TokenSegmentAllocation} from './extensions/TokenSegmentAllocation.sol';
import {TokenRemoteId} from './extensions/TokenRemoteId.sol';
import {ERC721URIStorage} from '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import {TokenHierarchy} from './extensions/TokenHierarchy.sol';

contract Token is
    ERC721,
    Ownable,
    TokenDataStorage,
    ERC721Burnable,
    TokenSegmentAllocation,
    TokenRemoteId,
    TokenHierarchy
{
    uint256 private _tokenIdCounter;

    event TokenMinted(
        address indexed receiver,
        uint256 indexed tokenId,
        string remoteId,
        string assetUri,
        string assetHash,
        string metadataUri,
        string metadataHash,
        string additionalData
    );

    constructor(address owner, string memory name, string memory symbol) ERC721(name, symbol) Ownable(owner) {}

    function mintToken(
        address receiver,
        string memory assetUri,
        string memory assetHash,
        string memory metadataUri,
        string memory metadataHash,
        string memory remoteId,
        string memory additionalData
    ) external {
        _mintToken(receiver, assetUri, assetHash, metadataUri, metadataHash, remoteId, additionalData);
    }

    function mintTokenAndAppendToHierarchy(
        address receiver,
        string memory assetUri,
        string memory assetHash,
        string memory metadataUri,
        string memory metadataHash,
        string memory remoteId,
        string memory additionalData,
        uint256[] memory parentIds
    ) external {
        uint256 tokenId = _mintToken(
            receiver,
            assetUri,
            assetHash,
            metadataUri,
            metadataHash,
            remoteId,
            additionalData
        );
        _appendNodeToHierarchy(tokenId, parentIds);
    }

    function updateToken(
        uint256 tokenId,
        string memory assetUri,
        string memory assetHash,
        string memory metadataUri,
        string memory metadataHash,
        string memory additionalData
    ) external {
        _setTokenData(tokenId, assetUri, assetHash, metadataUri, metadataHash, additionalData);
    }

    function getToken(
        uint256 tokenId
    ) public view returns (string memory remoteId, TokenData memory tokenData, Node memory node) {
        ensureTokenExists(tokenId);
        return (getRemoteIdByTokenId(tokenId), tokenIdWithTokenData[tokenId], getNode(tokenId));
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(ERC721, TokenDataStorage, TokenSegmentAllocation, TokenRemoteId, TokenHierarchy)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _mintToken(
        address receiver,
        string memory assetUri,
        string memory assetHash,
        string memory metadataUri,
        string memory metadataHash,
        string memory remoteId,
        string memory additionalData
    ) private returns (uint256 tokenId) {
        tokenId = _tokenIdCounter;

        unchecked {
            _tokenIdCounter++;
        }

        _safeMint(receiver, tokenId);
        _associateRemoteIdWithTokenId(tokenId, remoteId);
        _setTokenData(tokenId, assetUri, assetHash, metadataUri, metadataHash, additionalData);

        emit TokenMinted(receiver, tokenId, remoteId, assetUri, assetHash, metadataUri, metadataHash, additionalData);

        return tokenId;
    }

    function _setTokenData(
        uint256 tokenId,
        string memory assetUri,
        string memory assetHash,
        string memory metadataUri,
        string memory metadataHash,
        string memory additionalData
    ) private {
        ensureTokenExists(tokenId);

        if (bytes(assetUri).length > 0) {
            setAssetUri(tokenId, assetUri);
        }

        if (bytes(assetHash).length > 0) {
            setAssetHash(tokenId, assetHash);
        }

        if (bytes(metadataUri).length > 0) {
            setMetadataUri(tokenId, metadataUri);
        }

        if (bytes(metadataHash).length > 0) {
            setMetadataHash(tokenId, metadataHash);
        }

        if (bytes(additionalData).length > 0) {
            setAdditionalData(tokenId, additionalData);
        }
    }
}
