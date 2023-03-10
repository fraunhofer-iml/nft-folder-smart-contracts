/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.16;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// TODO-MP: how do we make the contract upgradable?
// TODO-MP: add event in container function

contract Segment is Ownable {
    struct TokenInformation {
        address tokenContract;
        uint256 tokenId;
    }

    struct TokenLocationInSegment {
        bool present;
        uint256 tokenInformationIndex;
    }

    string private _name;
    address private immutable _containerContract;
    TokenInformation[] private _tokenInformation;

    // token address -> tokenId -> TokenLocationInSegment
    mapping(address => mapping(uint256 => TokenLocationInSegment)) private _tokenLocationInSegment;

    event TokenAdded(address indexed from, address indexed tokenContract, uint256 tokenId);
    event TokenRemoved(address indexed from, address indexed tokenContract, uint256 tokenId);

    constructor(address owner, string memory name, address containerContract) {
        require(owner != address(0), "Segment: owner is zero address");
        require(bytes(name).length > 0, "Segment: name is empty");
        require(containerContract != address(0), "Segment: containerContract is zero address");

        _transferOwnership(owner);
        _name = name;
        _containerContract = containerContract;
    }

    // TODO-MP: sync with actual nft contract (e.g. check via functions)
    function addToken(address tokenContract, uint256 tokenId) external onlyOwner {
        require(tokenContract != address(0), "Segment: tokenContract is zero address");
        require(
            !_tokenLocationInSegment[tokenContract][tokenId].present,
            "Segment: tokenContract and tokenId already exist in segment"
        );

        _tokenInformation.push(TokenInformation(tokenContract, tokenId));

        _tokenLocationInSegment[tokenContract][tokenId].present = true;
        _tokenLocationInSegment[tokenContract][tokenId].tokenInformationIndex = _tokenInformation.length - 1;

        emit TokenAdded(msg.sender, tokenContract, tokenId);
    }

    // TODO-MP: sync with actual nft contract (e.g. check via functions)
    function removeToken(address tokenContract, uint256 tokenId) external onlyOwner {
        require(tokenContract != address(0), "Segment: tokenContract is zero address");
        require(_tokenInformation.length > 0, "Segment: no tokens stored in segment");
        require(
            _tokenLocationInSegment[tokenContract][tokenId].present,
            "Segment: tokenContract and tokenId do not exist in segment"
        );

        uint256 indexFromElementToBeRemoved = _tokenLocationInSegment[tokenContract][tokenId].tokenInformationIndex;
        delete _tokenLocationInSegment[tokenContract][tokenId];

        // Override to be removed element with last element
        _tokenInformation[indexFromElementToBeRemoved] = _tokenInformation[_tokenInformation.length - 1];
        _tokenInformation.pop();

        // Update index of moved element, but only if it is not the last (already removed) element
        if (indexFromElementToBeRemoved < _tokenInformation.length) {
            address movedTokenContract = _tokenInformation[indexFromElementToBeRemoved].tokenContract;
            uint256 movedTokenId = _tokenInformation[indexFromElementToBeRemoved].tokenId;
            _tokenLocationInSegment[movedTokenContract][movedTokenId]
                .tokenInformationIndex = indexFromElementToBeRemoved;
        }

        emit TokenRemoved(msg.sender, tokenContract, tokenId);
    }

    function getName() external view returns (string memory) {
        return _name;
    }

    function getContainerContract() external view returns (address) {
        return _containerContract;
    }

    function getTokenInformation(uint256 index) external view returns (TokenInformation memory) {
        require(index < _tokenInformation.length, "Segment: index is too big");
        return _tokenInformation[index];
    }

    function getTokenLocationInSegment(
        address tokenContract,
        uint256 tokenId
    ) external view returns (TokenLocationInSegment memory) {
        require(
            _tokenLocationInSegment[tokenContract][tokenId].present,
            "Segment: tokenContract and tokenId do not exist in segment"
        );
        return _tokenLocationInSegment[tokenContract][tokenId];
    }

    function isTokenInSegment(address tokenContract, uint256 tokenId) external view returns (bool) {
        return _tokenLocationInSegment[tokenContract][tokenId].present;
    }
}
