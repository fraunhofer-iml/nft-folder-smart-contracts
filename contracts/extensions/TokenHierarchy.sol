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
        uint256[] childIds; // The child tokens that this token is a parent of
        uint256[] parentIds; // The parent tokens that this token is a child of
    }

    mapping(uint256 tokenId => Node node) private _nodes;
    mapping(uint256 childId => mapping(uint256 parentId => bool confirmed)) private _parentConfirmations; // The parent token confirmations for each token

    event NodeAppendedToHierarchy(uint256 indexed tokenId, uint256[] parentIds);
    event ChildOfParentConfirmed(address indexed from, uint256 indexed childId, uint256 indexed parentId);

    error UnauthorizedAccess();
    error ChildNotFound();
    error ChildAlreadyConfirmed();
    error TokenIsItsOwnParent();
    error TokenIsNotInHierarchy();

    function confirmChildOfParent(uint256 childId, uint256 parentId) public {
        ensureTokenExists(childId);
        ensureTokenExists(parentId);

        if (_ownerOf(parentId) != _msgSender()) {
            revert UnauthorizedAccess();
        }

        if (!_isChildOfParent(childId, parentId)) {
            revert ChildNotFound();
        }

        if (_parentConfirmations[childId][parentId]) {
            revert ChildAlreadyConfirmed();
        }

        _parentConfirmations[childId][parentId] = true;

        emit ChildOfParentConfirmed(_msgSender(), childId, parentId);
    }

    function getParentIds(uint256 childId, bool confirmed) public view returns (uint256[] memory) {
        ensureTokenExists(childId);
        return _filterParentOrChildIds(childId, _nodes[childId].parentIds, confirmed, _compareParent);
    }

    function getChildIds(uint256 parentId, bool confirmed) public view returns (uint256[] memory) {
        ensureTokenExists(parentId);
        return _filterParentOrChildIds(parentId, _nodes[parentId].childIds, confirmed, _compareChild);
    }

    function getNode(uint256 tokenId) public view returns (Node memory node) {
        ensureTokenExists(tokenId);
        return _nodes[tokenId];
    }

    // Append only during minting
    function _appendNodeToHierarchy(uint256 tokenId, uint256[] memory parentIds) internal {
        _nodes[tokenId].exists = true;
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

        emit NodeAppendedToHierarchy(tokenId, parentIds);
    }

    // This function is called by the implementing contract, but slither doesn't recognize this
    // slither-disable-next-line dead-code
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        // TODO-MP: will be implemented in the future
        return super._update(to, tokenId, auth);
    }

    function _isChildOfParent(uint256 childId, uint256 parentId) private view returns (bool) {
        uint256[] memory childIds = _nodes[parentId].childIds;

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
