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

// TODO-MP: maybe we should have a maximum number of characters
abstract contract ERC721AdditionalInformation is ERC721 {
    mapping(uint256 => string) private _tokenIdWithAdditionalInformation;

    function setAdditionalInformation(uint256 tokenId, string memory additionalInformation) public {
        require(_exists(tokenId), "ERC721AdditionalInformation: token does not exist");
        _tokenIdWithAdditionalInformation[tokenId] = additionalInformation;
    }

    function getAdditionalInformation(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "ERC721AdditionalInformation: token does not exist");
        return _tokenIdWithAdditionalInformation[tokenId];
    }

    // This function is called by the implementing contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
    function _burn(uint256 tokenId) internal virtual override {
        super._burn(tokenId);

        if (bytes(_tokenIdWithAdditionalInformation[tokenId]).length != 0) {
            delete _tokenIdWithAdditionalInformation[tokenId];
        }
    }
}
