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

abstract contract ERC721Asset is ERC721 {
    struct AssetInformation {
        string assetUri;
        string assetHash;
    }

    mapping(uint256 => AssetInformation) private _tokenIdWithAssetInformation;
    string private constant ERROR_MESSAGE = "ERC721Asset: token does not exist";

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
        require(_exists(tokenId), ERROR_MESSAGE);

        string memory oldAssetUri = _tokenIdWithAssetInformation[tokenId].assetUri;
        _tokenIdWithAssetInformation[tokenId].assetUri = assetUri;

        emit AssetUriSet(oldAssetUri, assetUri, msg.sender, address(this), tokenId);
    }

    function setAssetHash(uint256 tokenId, string memory assetHash) public {
        require(_exists(tokenId), ERROR_MESSAGE);

        string memory oldAssetHash = _tokenIdWithAssetInformation[tokenId].assetHash;
        _tokenIdWithAssetInformation[tokenId].assetHash = assetHash;

        emit AssetHashSet(oldAssetHash, assetHash, msg.sender, address(this), tokenId);
    }

    function getAssetInformation(uint256 tokenId) public view returns (AssetInformation memory) {
        require(_exists(tokenId), ERROR_MESSAGE);
        return _tokenIdWithAssetInformation[tokenId];
    }

    function getAssetUri(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), ERROR_MESSAGE);
        return _tokenIdWithAssetInformation[tokenId].assetUri;
    }

    function getAssetHash(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), ERROR_MESSAGE);
        return _tokenIdWithAssetInformation[tokenId].assetHash;
    }

    // This function is called by the implementing contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
    function _burn(uint256 tokenId) internal virtual override {
        super._burn(tokenId);

        if (
            bytes(_tokenIdWithAssetInformation[tokenId].assetUri).length != 0 &&
            bytes(_tokenIdWithAssetInformation[tokenId].assetHash).length != 0
        ) {
            delete _tokenIdWithAssetInformation[tokenId];
        }
    }
}
