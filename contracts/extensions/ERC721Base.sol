/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.20;

import {ERC721URIStorage} from '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

abstract contract ERC721Base is ERC721URIStorage {
    error TokenIdDoesNotExist();

    function ensureTokenExists(uint256 tokenId) internal view {
        if (_ownerOf(tokenId) == address(0)) {
            revert TokenIdDoesNotExist();
        }
    }
}
