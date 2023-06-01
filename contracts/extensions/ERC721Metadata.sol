/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.18;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

abstract contract ERC721Metadata is ERC721URIStorage {
    mapping(uint256 => string) private _tokenIdWithMetadataHash;
    string private constant ERROR_MESSAGE = "ERC721Metadata: token does not exist";

    function setMetadataUri(uint256 tokenId, string memory metadataUri) public {
        require(_exists(tokenId), ERROR_MESSAGE);
        super._setTokenURI(tokenId, metadataUri);
    }

    function setMetadataHash(uint256 tokenId, string memory metadataHash) public {
        require(_exists(tokenId), ERROR_MESSAGE);
        _tokenIdWithMetadataHash[tokenId] = metadataHash;
    }

    function getMetadataUri(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), ERROR_MESSAGE);
        return super.tokenURI(tokenId);
    }

    function getMetadataHash(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), ERROR_MESSAGE);
        return _tokenIdWithMetadataHash[tokenId];
    }

    // This function is called by the implementing contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
    function _burn(uint256 tokenId) internal virtual override {
        super._burn(tokenId);

        if (bytes(_tokenIdWithMetadataHash[tokenId]).length != 0) {
            delete _tokenIdWithMetadataHash[tokenId];
        }
    }
}
