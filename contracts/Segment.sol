/**
 * SPDX-License-Identifier: Open Logistics Foundation
 *
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Token} from "./Token.sol";

contract Segment is Ownable {
    struct TokenInformation {
        address tokenAddress;
        uint256 tokenId;
    }

    string private _name;
    address private immutable _containerAddress;
    TokenInformation[] private _tokenInformation;

    event TokenAdded(address indexed from, address indexed tokenAddress, uint256 tokenId);
    event TokenRemoved(address indexed from, address indexed tokenAddress, uint256 tokenId);

    modifier onlyContainer(address containerAddress) {
        require(msg.sender == containerAddress, "Segment: can only be created from a container");
        _;
    }

    constructor(address owner, string memory name, address containerAddress) onlyContainer(containerAddress) {
        require(bytes(name).length > 0, "Segment: name is empty");

        _transferOwnership(owner);
        _name = name;
        _containerAddress = containerAddress;
    }

    function addToken(address tokenAddress, uint256 tokenId) external onlyOwner {
        require(tokenAddress != address(0), "Segment: token is zero address");
        require(!isTokenInSegment(tokenAddress, tokenId), "Segment: token and tokenId already exist in segment");

        _tokenInformation.push(TokenInformation(tokenAddress, tokenId));

        emit TokenAdded(msg.sender, tokenAddress, tokenId);

        Token tokenContract = Token(tokenAddress);
        tokenContract.addTokenToSegment(tokenId, address(this));
    }

    function removeToken(address tokenAddress, uint256 tokenId) external onlyOwner {
        require(tokenAddress != address(0), "Segment: token is zero address");
        require(isTokenInSegment(tokenAddress, tokenId), "Segment: token and tokenId do not exist in segment");

        for (uint256 i = 0; i < _tokenInformation.length; i++) {
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

    function getName() external view returns (string memory) {
        return _name;
    }

    function getContainer() external view returns (address) {
        return _containerAddress;
    }

    function getTokenInformation() external view returns (TokenInformation[] memory) {
        return _tokenInformation;
    }

    function getTokenInformation(uint256 index) external view returns (TokenInformation memory) {
        require(index < _tokenInformation.length, "Segment: index is too big");
        return _tokenInformation[index];
    }

    function getNumberOfTokenInformation() external view returns (uint256) {
        return _tokenInformation.length;
    }

    function isTokenInSegment(address tokenAddress, uint256 tokenId) public view returns (bool) {
        for (uint256 i = 0; i < _tokenInformation.length; i++) {
            if (_tokenInformation[i].tokenAddress == tokenAddress && _tokenInformation[i].tokenId == tokenId) {
                return true;
            }
        }

        return false;
    }
}
