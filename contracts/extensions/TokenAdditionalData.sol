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
abstract contract TokenAdditionalData is TokenExtensionBase {
    mapping(uint256 => string) private _tokenIdWithAdditionalData;

    event AdditionalDataSet(
        string oldAdditionalData,
        string newAdditionalData,
        address indexed from,
        address indexed tokenAddress,
        uint256 indexed tokenId
    );

    function setAdditionalData(uint256 tokenId, string memory additionalData) public {
        ensureTokenExists(tokenId);

        string memory oldAdditionalData = _tokenIdWithAdditionalData[tokenId];
        _tokenIdWithAdditionalData[tokenId] = additionalData;

        emit AdditionalDataSet(oldAdditionalData, additionalData, msg.sender, address(this), tokenId);
    }

    function getAdditionalData(uint256 tokenId) public view returns (string memory) {
        ensureTokenExists(tokenId);

        return _tokenIdWithAdditionalData[tokenId];
    }

    // This function is called by the implementing contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        if (to == address(0) && bytes(_tokenIdWithAdditionalData[tokenId]).length != 0) {
            delete _tokenIdWithAdditionalData[tokenId];
        }

        return super._update(to, tokenId, auth);
    }
}
