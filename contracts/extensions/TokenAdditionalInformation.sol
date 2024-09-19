/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.24;

import {TokenExtensionBase} from './TokenExtensionBase.sol';

// TODO-MP: maybe we should have a maximum number of characters
abstract contract TokenAdditionalInformation is TokenExtensionBase {
    mapping(uint256 => string) private _tokenIdWithAdditionalInformation;

    event AdditionalInformationSet(
        string oldAdditionalInformation,
        string newAdditionalInformation,
        address indexed from,
        address indexed tokenAddress,
        uint256 indexed tokenId
    );

    function setAdditionalInformation(uint256 tokenId, string memory additionalInformation) public {
        ensureTokenExists(tokenId);

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
        ensureTokenExists(tokenId);

        return _tokenIdWithAdditionalInformation[tokenId];
    }

    // This function is called by the implementing contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        if (to == address(0) && bytes(_tokenIdWithAdditionalInformation[tokenId]).length != 0) {
            delete _tokenIdWithAdditionalInformation[tokenId];
        }

        return super._update(to, tokenId, auth);
    }
}
