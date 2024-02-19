/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/src/signers';

import { Container, Segment, Token } from '../typechain-types';
import { CONTAINER, SEGMENT, TOKEN } from './constants';

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
      tokenInstance = await ethers.deployContract('Token', [TOKEN.token1.name, TOKEN.token1.symbol]);
    });

    it('should mint, add to segment and burn a token', async () => {
      await mintToken.call(this);
      await addTokenToSegment.call(this);
      await burnToken.call(this);
    });

    async function mintToken() {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      const balanceOfAlice = await tokenInstance.balanceOf(alice);
      expect(balanceOfAlice).to.be.equal('1');

      const ownerOf = await tokenInstance.ownerOf('0');
      expect(ownerOf).to.be.equal(alice);

      const tokenUri = await tokenInstance.tokenURI('0');
      expect(tokenUri).to.be.equal(TOKEN.metadata1.uri);

      const additionalInformation = await tokenInstance.getAdditionalInformation('0');
      expect(additionalInformation).to.be.equal(TOKEN.additionalInformation1.initial);

      const assetInformation = await tokenInstance.getAssetInformation('0');
      expect(assetInformation.assetUri).to.be.equal(TOKEN.asset1.uri);
      expect(assetInformation.assetHash).to.be.equal(TOKEN.asset1.hash);

      const remoteId = await tokenInstance.getRemoteId('0');
      expect(remoteId).to.be.equal(TOKEN.remoteId1);

      const tokenId = await tokenInstance.getTokenId(TOKEN.remoteId1);
      expect(tokenId).to.be.equal('0');

      const metadataHash = await tokenInstance.getMetadataHash('0');
      expect(metadataHash).to.be.equal(TOKEN.metadata1.hash);

      const segments = await tokenInstance.getAllSegments('0');
      expect(segments).to.be.empty;

      await expect(tokenInstance.getSegment('0', '0')).to.be.revertedWithCustomError(
        tokenInstance,
        'WrongSegmentIndex',
      );

      const numberOfSegments = await tokenInstance.getNumberOfSegments('0');
      expect(numberOfSegments).to.be.equal('0');
    }

    async function addTokenToSegment() {
      await segmentInstance.addToken(await tokenInstance.getAddress(), '0');

      // segment side
      const tokenInformation = await segmentInstance.getTokenInformation('0');
      expect(tokenInformation.tokenAddress).to.be.equal(await tokenInstance.getAddress());
      expect(tokenInformation.tokenId).to.be.equal('0');

      const numberOfTokenInformation = await segmentInstance.getNumberOfTokenInformation();
      expect(numberOfTokenInformation).to.be.equal('1');

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
      await expectRevert(tokenInstance.getAdditionalInformation("0"), "ERC721: invalid token ID");
      await expectRevert(tokenInstance.getAssetInformation("0"), "ERC721: invalid token ID");
      await expectRevert(tokenInstance.getMetadataHash("0"), "ERC721: invalid token ID");
      await expectRevert(tokenInstance.getRemoteId("0"), "ERC721: invalid token ID");
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
