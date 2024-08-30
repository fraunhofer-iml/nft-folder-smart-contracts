/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.24;

import {ERC721Base} from './ERC721Base.sol';

abstract contract HierarchicalStructure is ERC721Base {
    struct Node {
        bool active;
        uint256 predecessorId; // The previous token in the replacement chain that this token replaces
        uint256 successorId; // The next token in the replacement chain that replaces this token
        uint256[] childIds; // The child tokens that this token is a parent of
        uint256[] parentIds; // The parent tokens that this token is a child of
    }

    mapping(uint256 tokenId => Node node) private _nodes;
    mapping(uint256 tokenId => mapping(uint256 parentId => bool confirmed)) private _parentConfirmations; // The parent token confirmations for each token

    function getNode(uint256 tokenId) public view returns (Node memory node) {
        ensureTokenExists(tokenId);

        return _nodes[tokenId];
    }

    function getConfirmedParentIds(uint256 tokenId) public view returns (uint256[] memory) {
        ensureTokenExists(tokenId);

        return _filterParentIds(tokenId, true);
    }

    function getUnconfirmedParentIds(uint256 tokenId) public view returns (uint256[] memory) {
        ensureTokenExists(tokenId);

        return _filterParentIds(tokenId, false);
    }

    function _filterParentIds(uint256 tokenId, bool confirmed) private view returns (uint256[] memory) {
        uint256 numberOfAllParentIds = _nodes[tokenId].parentIds.length;

        uint256[] memory filteredParentIds = new uint256[](numberOfAllParentIds); // We cannot know the exact number of parentIds that will be filtered
        uint256 numberOfFilteredParentIds = 0;

        // Filter the parentIds based on the confirmed status
        for (uint256 i = 0; i < numberOfAllParentIds; i++) {
            uint256 currentParentId = _nodes[tokenId].parentIds[i];

            if (_parentConfirmations[tokenId][currentParentId] == confirmed) {
                filteredParentIds[numberOfFilteredParentIds] = currentParentId;
                numberOfFilteredParentIds++;
            }
        }

        // Create a new array based on the actual number of filtered parentIds
        uint256[] memory finalFilteredParentIds = new uint256[](numberOfFilteredParentIds);

        for (uint256 i = 0; i < numberOfFilteredParentIds; i++) {
            finalFilteredParentIds[i] = filteredParentIds[i];
        }

        return finalFilteredParentIds;
    }
}
