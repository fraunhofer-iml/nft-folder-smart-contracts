/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/src/signers';

import { Container, Segment, Token } from '../typechain-types';
import { CONTAINER, SEGMENT, TOKEN } from './constants';
import { TokenDataStorage } from '../typechain-types/contracts/Token';

describe('Container', async () => {
  let alice: HardhatEthersSigner;
  let containerInstance: Container;
  let segmentInstance: Segment;
  let tokenInstance: Token;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  describe('integration', function () {
    beforeEach(async () => {
      containerInstance = await ethers.deployContract('Container', [alice, CONTAINER.name]);
      await containerInstance.createSegment(SEGMENT.name);
      segmentInstance = await ethers.getContractAt('Segment', await containerInstance.getSegment(0));
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should mint, add to segment and burn a token', async () => {
      await mintToken.call(this);
      await addTokenToSegment.call(this);
      await burnToken.call(this);
    });

    async function mintToken() {
      await tokenInstance.mintToken(
        alice,
        TOKEN.remoteId1,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.additionalData1.initial,
      );

      const balanceOfAlice = await tokenInstance.balanceOf(alice);
      expect(balanceOfAlice).to.be.equal('1');

      const ownerOf = await tokenInstance.ownerOf('0');
      expect(ownerOf).to.be.equal(alice);

      const tokenUri = await tokenInstance.tokenURI('0');
      expect(tokenUri).to.be.equal(TOKEN.metadata1.uriInitial);

      const tokenDataStruct: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(0)).tokenData;
      expect(tokenDataStruct.additionalData).to.be.equal(TOKEN.additionalData1.initial);

      expect(tokenDataStruct.asset.uri).to.be.equal(TOKEN.asset1.uriInitial);
      expect(tokenDataStruct.asset.hash).to.be.equal(TOKEN.asset1.hashInitial);

      const remoteId = await tokenInstance.getRemoteIdByTokenId('0');
      expect(remoteId).to.be.equal(TOKEN.remoteId1);

      const tokenIdForRemoteId: bigint = (await tokenInstance.getTokenIdsByRemoteId(TOKEN.remoteId1))[0];
      expect(tokenIdForRemoteId).to.be.equal(0n);

      const tokenIdForOwner: bigint = (await tokenInstance.getTokenIdsByOwner(alice))[0];
      expect(tokenIdForOwner).to.be.equal(0n);

      expect(tokenDataStruct.metadata.uri).to.be.equal(TOKEN.metadata1.uriInitial);
      expect(tokenDataStruct.metadata.hash).to.be.equal(TOKEN.metadata1.hashInitial);

      const segments = await tokenInstance.getAllSegments('0');
      expect(segments).to.be.empty;

      await expect(tokenInstance.getSegment('0', '0')).to.be.revertedWithCustomError(
        tokenInstance,
        'IndexExceedsSegmentLengthForToken',
      );

      const numberOfSegments = await tokenInstance.getNumberOfSegments('0');
      expect(numberOfSegments).to.be.equal('0');
    }

    async function addTokenToSegment() {
      await segmentInstance.addToken(await tokenInstance.getAddress(), '0');

      // segment side
      const tokenData = await segmentInstance.getTokenInformation('0');
      expect(tokenData.tokenAddress).to.be.equal(await tokenInstance.getAddress());
      expect(tokenData.tokenId).to.be.equal('0');

      const numberOfTokenData = await segmentInstance.getNumberOfTokenInformation();
      expect(numberOfTokenData).to.be.equal('1');

      const tokenInSegment_segmentSide = await segmentInstance.isTokenInSegment(await tokenInstance.getAddress(), '0');
      expect(tokenInSegment_segmentSide).to.be.true;

      // token side
      const segments = await tokenInstance.getAllSegments('0');
      expect(segments).to.be.lengthOf('1');
      expect(segments[0]).to.be.equal(await segmentInstance.getAddress());

      const segment = await tokenInstance.getSegment('0', '0');
      expect(segment).to.be.equal(await segmentInstance.getAddress());

      const numberOfSegments = await tokenInstance.getNumberOfSegments('0');
      expect(numberOfSegments).to.be.equal('1');

      const tokenInSegment_tokenSide = await tokenInstance.isTokenInSegment('0', await segmentInstance.getAddress());
      expect(tokenInSegment_tokenSide).to.be.true;
    }

    async function burnToken() {
      /* TODO-MP: fix calling burn function
      const newVar = await tokenInstance.burn("0").send({ from: alice });
      console.log(newVar);

      //const balanceOfAlice = await tokenInstance.balanceOf(alice);
      //expect(balanceOfAlice).to.be.equal("0");

      await expectRevert(tokenInstance.ownerOf("0"), "ERC721: invalid token ID");
      await expectRevert(tokenInstance.tokenURI("0"), "ERC721: invalid token ID");
      await expectRevert(tokenInstance.getAdditionalData("0"), "ERC721: invalid token ID");
      await expectRevert(tokenInstance.getAssetData("0"), "ERC721: invalid token ID");
      await expectRevert(tokenInstance.getMetadataHash("0"), "ERC721: invalid token ID");
      await expectRevert(tokenInstance.getRemoteIdByTokenId("0"), "ERC721: invalid token ID");
      await expectRevert(tokenInstance.getTokenId(TOKEN.remoteId1), "ERC721: invalid token ID");

      const segments = await tokenInstance.getAllSegments("0");
      expect(segments).to.be.empty;

      await expectRevert(tokenInstance.getSegment("0", "0"), "ERC721SegmentAllocation: no segment at given index");

      const numberOfSegments = await tokenInstance.getNumberOfSegments("0");
      expect(numberOfSegments).to.be.equal("0");
       */
    }
  });
});
