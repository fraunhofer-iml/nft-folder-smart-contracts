/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

pragma solidity ^0.8.24;

import {ERC721URIStorage} from '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

abstract contract TokenExtensionBase is ERC721URIStorage {
    error TokenDoesNotExist(uint256 tokenId);

    function ensureTokenExists(uint256 tokenId) internal view {
        if (_ownerOf(tokenId) == address(0)) {
            revert TokenDoesNotExist(tokenId);
        }
    }
}
