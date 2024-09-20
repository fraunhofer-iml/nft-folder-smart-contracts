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

abstract contract TokenHierarchy is TokenExtensionBase {
    struct Node {
        bool exists;
        bool active;
        uint256 predecessorId; // The previous token in the replacement chain that this token replaces
        uint256 successorId; // The next token in the replacement chain that replaces this token
        uint256[] childIds; // The child tokens that this token is a parent of
        uint256[] parentIds; // The parent tokens that this token is a child of
    }

    mapping(uint256 tokenId => Node node) private _nodes;
    mapping(uint256 tokenId => mapping(uint256 parentId => bool confirmed)) private _parentConfirmations; // The parent token confirmations for each token

    event TokenAppendedToHierarchy(uint256 indexed tokenId, uint256[] parentIds);
    event ChildConfirmed(address indexed from, uint256 indexed tokenId, uint256 indexed childId);

    error UnauthorizedAccess();
    error ChildNotFound();
    error ChildAlreadyConfirmed();
    error TokenIsItsOwnParent();
    error TokenIsNotInHierarchy();

    function confirmChild(uint256 tokenId, uint256 childId) public {
        ensureTokenExists(tokenId);
        ensureTokenExists(childId);

        if (_ownerOf(tokenId) != _msgSender()) {
            revert UnauthorizedAccess();
        }

        if (!_isChildOfToken(tokenId, childId)) {
            revert ChildNotFound();
        }

        if (_parentConfirmations[childId][tokenId]) {
            revert ChildAlreadyConfirmed();
        }

        _parentConfirmations[childId][tokenId] = true;

        emit ChildConfirmed(_msgSender(), tokenId, childId);
    }

    function getNode(uint256 tokenId) public view returns (Node memory node) {
        ensureTokenExists(tokenId);

        return _nodes[tokenId];
    }

    function getParentIds(uint256 tokenId, bool confirmed) public view returns (uint256[] memory) {
        ensureTokenExists(tokenId);
        return _filterParentOrChildIds(tokenId, _nodes[tokenId].parentIds, confirmed, _compareParent);
    }

    function getChildIds(uint256 tokenId, bool confirmed) public view returns (uint256[] memory) {
        ensureTokenExists(tokenId);
        return _filterParentOrChildIds(tokenId, _nodes[tokenId].childIds, confirmed, _compareChild);
    }

    // Append only during minting
    function _appendTokenToHierarchy(uint256 tokenId, uint256[] memory parentIds) internal {
        _nodes[tokenId].exists = true;
        _nodes[tokenId].active = true;
        _nodes[tokenId].predecessorId = type(uint256).max;
        _nodes[tokenId].successorId = type(uint256).max;
        _nodes[tokenId].parentIds = parentIds; // if empty, the token is a root token

        for (uint256 i = 0; i < parentIds.length; i++) {
            uint256 parentId = parentIds[i];

            ensureTokenExists(parentId);

            if (parentId == tokenId) {
                revert TokenIsItsOwnParent();
            }

            if (!_nodes[parentId].exists) {
                revert TokenIsNotInHierarchy();
            }

            _nodes[parentId].childIds.push(tokenId);
        }

        emit TokenAppendedToHierarchy(tokenId, parentIds);
    }

    // This function is called by the implementing contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        // TODO-MP: will be implemented in the future
        return super._update(to, tokenId, auth);
    }

    function _isChildOfToken(uint256 tokenId, uint256 childId) private view returns (bool) {
        uint256[] memory childIds = _nodes[tokenId].childIds;

        for (uint256 i = 0; i < childIds.length; i++) {
            if (childIds[i] == childId) {
                return true;
            }
        }

        return false;
    }

    // This function is called as a function pointer in the _filterParentOrChildIds function
    // slither-disable-next-line dead-code
    function _compareParent(uint256 tokenId, uint256 currentId, bool confirmed) private view returns (bool) {
        return _parentConfirmations[tokenId][currentId] == confirmed;
    }

    // This function is called as a function pointer in the _filterParentOrChildIds function
    // slither-disable-next-line dead-code
    function _compareChild(uint256 tokenId, uint256 currentId, bool confirmed) private view returns (bool) {
        return _parentConfirmations[currentId][tokenId] == confirmed;
    }

    function _filterParentOrChildIds(
        uint256 tokenId,
        uint256[] memory ids,
        bool confirmed,
        function(uint256, uint256, bool) view returns (bool) compare
    ) private view returns (uint256[] memory) {
        uint256[] memory filteredIds = new uint256[](ids.length);
        uint256 filteredIdsCounter = 0;

        // Filter the parentIds or childIds based on the confirmed status
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 currentId = ids[i];

            if (compare(tokenId, currentId, confirmed)) {
                filteredIds[filteredIdsCounter] = currentId;
                filteredIdsCounter++;
            }
        }

        // Create a new array based on the actual number of filtered parentIds or childIds
        uint256[] memory result = new uint256[](filteredIdsCounter);
        for (uint256 i = 0; i < filteredIdsCounter; i++) {
            result[i] = filteredIds[i];
        }

        return result;
    }
}
