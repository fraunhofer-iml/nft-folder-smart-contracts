/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.16;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

abstract contract ERC721Metadata is ERC721URIStorage {
    mapping(uint256 => string) private _tokenIdWithMetadataHash;

    function getMetadataHash(uint256 tokenId) public view virtual returns (string memory) {
        _requireMinted(tokenId);
        return _tokenIdWithMetadataHash[tokenId];
    }

    function _setMetadataHash(uint256 tokenId, string memory metadataUri, string memory metadataHash) internal virtual {
        super._setTokenURI(tokenId, metadataUri);
        _tokenIdWithMetadataHash[tokenId] = metadataHash;
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
