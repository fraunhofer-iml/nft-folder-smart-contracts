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
import {ERC721AdditionalInformation} from './extensions/ERC721AdditionalInformation.sol';
import {ERC721Asset} from './extensions/ERC721Asset.sol';
import {ERC721Burnable} from '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol';
import {ERC721Metadata} from './extensions/ERC721Metadata.sol';
import {ERC721SegmentAllocation} from './extensions/ERC721SegmentAllocation.sol';
import {ERC721RemoteId} from './extensions/ERC721RemoteId.sol';
import {ERC721URIStorage} from '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

contract Token is
    ERC721,
    Ownable,
    ERC721AdditionalInformation,
    ERC721Asset,
    ERC721Burnable,
    ERC721Metadata,
    ERC721SegmentAllocation,
    ERC721RemoteId
{
    uint256 private _tokenIdCounter;

    constructor(address owner, string memory name, string memory symbol) ERC721(name, symbol) Ownable(owner) {}

    function safeMint(
        address receiver,
        string memory assetUri,
        string memory assetHash,
        string memory metadataUri,
        string memory metadataHash,
        string memory remoteId,
        string memory additionalInformation
    ) public {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter = _tokenIdCounter + 1;
        _safeMint(receiver, tokenId);
        setAssetUri(tokenId, assetUri);
        setAssetHash(tokenId, assetHash);
        setMetadataUri(tokenId, metadataUri);
        setMetadataHash(tokenId, metadataHash);
        _associateRemoteIdWithTokenId(tokenId, remoteId);
        setAdditionalInformation(tokenId, additionalInformation);
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
            string memory additionalInformation
        )
    {
        return (
            getAssetUri(tokenId),
            getAssetHash(tokenId),
            getMetadataUri(tokenId),
            getMetadataHash(tokenId),
            getAdditionalInformation(tokenId)
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
            ERC721AdditionalInformation,
            ERC721Asset,
            ERC721Metadata,
            ERC721SegmentAllocation,
            ERC721RemoteId
        )
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
}
