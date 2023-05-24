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
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721AdditionalInformation} from "./extensions/ERC721AdditionalInformation.sol";
import {ERC721Asset} from "./extensions/ERC721Asset.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721Metadata} from "./extensions/ERC721Metadata.sol";
import {ERC721SegmentAllocation} from "./extensions/ERC721SegmentAllocation.sol";
import {ERC721RemoteId} from "./extensions/ERC721RemoteId.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

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
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function safeMint(
        address receiver,
        string memory assetUri,
        string memory assetHash,
        string memory metadataUri,
        string memory metadataHash,
        string memory remoteId,
        string memory additionalInformation
    ) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(receiver, tokenId);
        _setAssetInformation(tokenId, assetUri, assetHash);
        _setMetadataHash(tokenId, metadataUri, metadataHash);
        _setRemoteId(tokenId, remoteId);
        _setAdditionalInformation(tokenId, additionalInformation);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _burn(
        uint256 tokenId
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
    {
        super._burn(tokenId);
    }
}
