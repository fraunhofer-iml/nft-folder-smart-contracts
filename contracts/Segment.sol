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
import {Token} from "./Token.sol";

contract Segment is Ownable {
    // TODO-MP: maybe both fields can be moved to TokenLocationInSegment
    struct TokenInformation {
        address token; // TODO-MP: rename to tokenContract
        uint256 tokenId;
    }

    struct TokenLocationInSegment {
        bool present;
        uint256 tokenInformationIndex; // TODO-MP: could be removed along with TokenInformation
    }

    string private _name;
    address private immutable _container;
    TokenInformation[] private _tokenInformation;

    // token address -> tokenId -> TokenLocationInSegment
    mapping(address => mapping(uint256 => TokenLocationInSegment)) private _tokenLocationInSegment;

    event TokenAdded(address indexed from, address indexed token, uint256 tokenId);
    event TokenRemoved(address indexed from, address indexed token, uint256 tokenId);

    modifier onlyContainer(address container) {
        require(msg.sender == container, "Segment: can only be created from a container");
        _;
    }

    constructor(address owner, string memory name, address container) onlyContainer(container) {
        require(bytes(name).length > 0, "Segment: name is empty");

        _transferOwnership(owner);
        _name = name;
        _container = container;
    }

    function addToken(address token, uint256 tokenId) external onlyOwner {
        require(token != address(0), "Segment: token is zero address");
        require(
            !_tokenLocationInSegment[token][tokenId].present,
            "Segment: token and tokenId already exist in segment"
        );

        _tokenInformation.push(TokenInformation(token, tokenId));

        _tokenLocationInSegment[token][tokenId].present = true;
        _tokenLocationInSegment[token][tokenId].tokenInformationIndex = _tokenInformation.length - 1;

        emit TokenAdded(msg.sender, token, tokenId);

        Token tokenContract = Token(token);
        tokenContract.addTokenToSegment(tokenId, address(this));
    }

    function removeToken(address token, uint256 tokenId) external onlyOwner {
        require(token != address(0), "Segment: token is zero address");
        require(_tokenInformation.length > 0, "Segment: no tokens stored in segment");
        require(_tokenLocationInSegment[token][tokenId].present, "Segment: token and tokenId do not exist in segment");

        uint256 indexFromElementToBeRemoved = _tokenLocationInSegment[token][tokenId].tokenInformationIndex;
        delete _tokenLocationInSegment[token][tokenId];

        // Override to be removed element with last element
        _tokenInformation[indexFromElementToBeRemoved] = _tokenInformation[_tokenInformation.length - 1];
        _tokenInformation.pop();

        // Update index of moved element, but only if it is not the last (already removed) element
        if (indexFromElementToBeRemoved < _tokenInformation.length) {
            address movedToken = _tokenInformation[indexFromElementToBeRemoved].token;
            uint256 movedTokenId = _tokenInformation[indexFromElementToBeRemoved].tokenId;
            _tokenLocationInSegment[movedToken][movedTokenId].tokenInformationIndex = indexFromElementToBeRemoved;
        }

        emit TokenRemoved(msg.sender, token, tokenId);

        Token tokenContract = Token(token);
        tokenContract.removeTokenFromSegment(tokenId, address(this));
    }

    function getName() external view returns (string memory) {
        return _name;
    }

    function getContainer() external view returns (address) {
        return _container;
    }

    function getTokenInformation(uint256 index) external view returns (TokenInformation memory) {
        require(index < _tokenInformation.length, "Segment: index is too big");
        return _tokenInformation[index];
    }

    function getTokenLocationInSegment(
        address token,
        uint256 tokenId
    ) external view returns (TokenLocationInSegment memory) {
        require(_tokenLocationInSegment[token][tokenId].present, "Segment: token and tokenId do not exist in segment");
        return _tokenLocationInSegment[token][tokenId];
    }

    // TODO-MP: this function also exists in Token.sol
    function isTokenInSegment(address token, uint256 tokenId) external view returns (bool) {
        return _tokenLocationInSegment[token][tokenId].present;
    }
}
