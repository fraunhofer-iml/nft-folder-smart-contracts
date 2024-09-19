/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.24;

import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {TokenAdditionalInformation} from './extensions/TokenAdditionalInformation.sol';
import {TokenAsset} from './extensions/TokenAsset.sol';
import {ERC721Burnable} from '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol';
import {TokenMetadata} from './extensions/TokenMetadata.sol';
import {TokenSegmentAllocation} from './extensions/TokenSegmentAllocation.sol';
import {TokenRemoteId} from './extensions/TokenRemoteId.sol';
import {ERC721URIStorage} from '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import {TokenHierarchy} from './extensions/TokenHierarchy.sol';

contract Token is
    ERC721,
    Ownable,
    TokenAdditionalInformation,
    TokenAsset,
    ERC721Burnable,
    TokenMetadata,
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
        string additionalInformation
    );

    constructor(address owner, string memory name, string memory symbol) ERC721(name, symbol) Ownable(owner) {}

    function mintToken(
        address receiver,
        string memory assetUri,
        string memory assetHash,
        string memory metadataUri,
        string memory metadataHash,
        string memory remoteId,
        string memory additionalInformation
    ) public returns (uint256 tokenId) {
        tokenId = _tokenIdCounter;
        _tokenIdCounter = _tokenIdCounter + 1;

        _safeMint(receiver, tokenId);

        _associateRemoteIdWithTokenId(tokenId, remoteId);

        setAssetUri(tokenId, assetUri);
        setAssetHash(tokenId, assetHash);
        setMetadataUri(tokenId, metadataUri);
        setMetadataHash(tokenId, metadataHash);
        setAdditionalInformation(tokenId, additionalInformation);

        emit TokenMinted(
            receiver,
            tokenId,
            remoteId,
            assetUri,
            assetHash,
            metadataUri,
            metadataHash,
            additionalInformation
        );

        return tokenId;
    }

    function mintTokenAndAppendToHierarchy(
        address receiver,
        string memory assetUri,
        string memory assetHash,
        string memory metadataUri,
        string memory metadataHash,
        string memory remoteId,
        string memory additionalInformation,
        uint256[] memory parentIds
    ) public {
        uint256 tokenId = mintToken(
            receiver,
            assetUri,
            assetHash,
            metadataUri,
            metadataHash,
            remoteId,
            additionalInformation
        );

        _appendTokenToHierarchy(tokenId, parentIds);
    }

    function updateToken(
        uint256 tokenId,
        string memory assetUri,
        string memory assetHash,
        string memory metadataUri,
        string memory metadataHash,
        string memory additionalInformation
    ) public {
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

        if (bytes(additionalInformation).length > 0) {
            setAdditionalInformation(tokenId, additionalInformation);
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function getToken(
        uint256 tokenId
    )
        public
        view
        returns (
            string memory assetUri,
            string memory assetHash,
            string memory metadataUri,
            string memory metadataHash,
            string memory additionalInformation,
            Node memory node
        )
    {
        return (
            getAssetUri(tokenId),
            getAssetHash(tokenId),
            getMetadataUri(tokenId),
            getMetadataHash(tokenId),
            getAdditionalInformation(tokenId),
            getNode(tokenId)
        );
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(
            ERC721,
            TokenAdditionalInformation,
            TokenAsset,
            TokenMetadata,
            TokenSegmentAllocation,
            TokenRemoteId // TODO-MP: add Hierarchy
        )
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
}
