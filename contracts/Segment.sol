/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.25;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {Token} from './Token.sol';

contract Segment is Ownable {
    struct TokenInformation {
        address tokenAddress;
        uint256 tokenId;
    }

    address private immutable _containerAddress;
    string private _name;
    TokenInformation[] private _tokenInformation;

    event TokenAdded(address indexed from, address indexed tokenAddress, uint256 tokenId);
    event TokenRemoved(address indexed from, address indexed tokenAddress, uint256 tokenId);

    error SenderIsNotAContainer();
    error SegmentNameIsEmpty();
    error TokenIsZeroAddress();
    error TokenAlreadyExists();
    error TokenDoesNotExist();
    error IndexTooLarge();

    modifier onlyContainer(address containerAddress) {
        if (msg.sender != containerAddress) revert SenderIsNotAContainer();
        _;
    }

    constructor(
        address owner,
        string memory name,
        address containerAddress
    ) onlyContainer(containerAddress) Ownable(owner) {
        if (bytes(name).length <= 0) revert SegmentNameIsEmpty();

        _name = name;
        _containerAddress = containerAddress;
    }

    function addToken(address tokenAddress, uint256 tokenId) external onlyOwner {
        if (tokenAddress == address(0)) revert TokenIsZeroAddress();
        if (isTokenInSegment(tokenAddress, tokenId)) revert TokenAlreadyExists();

        _tokenInformation.push(TokenInformation(tokenAddress, tokenId));

        emit TokenAdded(msg.sender, tokenAddress, tokenId);

        Token tokenContract = Token(tokenAddress);
        tokenContract.addTokenToSegment(tokenId, address(this));
    }

    function removeToken(address tokenAddress, uint256 tokenId) external onlyOwner {
        if (tokenAddress == address(0)) revert TokenIsZeroAddress();
        if (!isTokenInSegment(tokenAddress, tokenId)) revert TokenDoesNotExist();

        uint256 tokenInformationLength = _tokenInformation.length;

        for (uint256 i = 0; i < tokenInformationLength; i++) {
            if (_tokenInformation[i].tokenAddress == tokenAddress && _tokenInformation[i].tokenId == tokenId) {
                // Override to be removed token with last element
                _tokenInformation[i] = _tokenInformation[_tokenInformation.length - 1];
                break;
            }
        }

        _tokenInformation.pop();
        emit TokenRemoved(msg.sender, tokenAddress, tokenId);

        Token tokenContract = Token(tokenAddress);
        tokenContract.removeTokenFromSegment(tokenId, address(this));
    }

    function getContainer() external view returns (address) {
        return _containerAddress;
    }

    function getName() external view returns (string memory) {
        return _name;
    }

    function getAllTokenInformation() external view returns (TokenInformation[] memory) {
        return _tokenInformation;
    }

    function getTokenInformation(uint256 index) external view returns (TokenInformation memory) {
        if (index >= _tokenInformation.length) revert IndexTooLarge();
        return _tokenInformation[index];
    }

    function getNumberOfTokenInformation() external view returns (uint256) {
        return _tokenInformation.length;
    }

    function isTokenInSegment(address tokenAddress, uint256 tokenId) public view returns (bool) {
        uint256 tokenInformationLength = _tokenInformation.length;

        for (uint256 i = 0; i < tokenInformationLength; i++) {
            if (_tokenInformation[i].tokenAddress == tokenAddress && _tokenInformation[i].tokenId == tokenId) {
                return true;
            }
        }

        return false;
    }
}
