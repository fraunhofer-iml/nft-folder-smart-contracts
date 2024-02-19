/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.18;

import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {ErrorDefinitions} from './ErrorDefinitions.sol';

// TODO-MP: maybe we should have a maximum number of characters
abstract contract ERC721AdditionalInformation is ERC721, ErrorDefinitions {
    mapping(uint256 => string) private _tokenIdWithAdditionalInformation;

    event AdditionalInformationSet(
        string oldAdditionalInformation,
        string newAdditionalInformation,
        address indexed from,
        address indexed tokenAddress,
        uint256 indexed tokenId
    );

    function setAdditionalInformation(uint256 tokenId, string memory additionalInformation) public {
        if (!_exists(tokenId)) revert TokenIdDoesNotExist();

        string memory oldAdditionalInformation = _tokenIdWithAdditionalInformation[tokenId];
        _tokenIdWithAdditionalInformation[tokenId] = additionalInformation;

        emit AdditionalInformationSet(
            oldAdditionalInformation,
            additionalInformation,
            msg.sender,
            address(this),
            tokenId
        );
    }

    function getAdditionalInformation(uint256 tokenId) public view returns (string memory) {
        if (!_exists(tokenId)) revert TokenIdDoesNotExist();
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
