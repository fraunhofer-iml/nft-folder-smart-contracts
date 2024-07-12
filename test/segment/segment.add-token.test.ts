/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/src/signers';

import { Container, Segment, Token } from '../../typechain-types';
import { CONTAINER, SEGMENT, TOKEN } from '../constants';

describe('Segment', async () => {
  let alice: HardhatEthersSigner;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  describe('Add Token', () => {
    let containerInstance: Container;
    let segmentInstance1: Segment;
    let segmentInstance2: Segment;
    let tokenInstance1: Token;
    let tokenInstance2: Token;

    beforeEach(async () => {
      containerInstance = await ethers.deployContract('Container', [alice, CONTAINER.name]);

      await containerInstance.createSegment(SEGMENT.name);
      await containerInstance.createSegment('DifferentSegment');

      segmentInstance1 = await ethers.getContractAt('Segment', await containerInstance.getSegment(0));
      segmentInstance2 = await ethers.getContractAt('Segment', await containerInstance.getSegment(1));

      tokenInstance1 = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      tokenInstance2 = await ethers.deployContract('Token', [await alice.getAddress(), 'Token2', 'TKZ']);
    });

    async function assertSegment(
      segmentInstance: Segment,
      tokenAddress: string,
      tokenId: number,
      tokenInformationSize: number,
      tokenInformationIndex: number,
    ) {
      const actualAllTokenInformation = await segmentInstance.getAllTokenInformation();
      expect(actualAllTokenInformation.length).equal(tokenInformationSize);

      const actualTokenInformation = await segmentInstance.getTokenInformation(tokenInformationIndex);
      expect(actualTokenInformation.tokenAddress).equals(tokenAddress);
      expect(actualTokenInformation.tokenId).equals(tokenId);

      const actualNumberOfTokenInformation = await segmentInstance.getNumberOfTokenInformation();
      expect(actualNumberOfTokenInformation).to.equal(tokenInformationSize);

      const actualTokenInSegment = await segmentInstance.isTokenInSegment(tokenAddress, tokenId);
      expect(actualTokenInSegment).is.true;
    }

    async function assertToken(
      tokenInstance: Token,
      segmentAddress: string,
      tokenId: number,
      segmentIndex: number,
      numberOfSegments: number,
    ) {
      const actualNumberOfSegments = await tokenInstance.getNumberOfSegments(segmentIndex);
      expect(actualNumberOfSegments).to.equal(numberOfSegments);

      const actualSegmentAddress = await tokenInstance.getSegment(tokenId, segmentIndex);
      expect(actualSegmentAddress).to.be.equal(segmentAddress);

      const actualTokenInSegment = await tokenInstance.isTokenInSegment(tokenId, segmentAddress);
      expect(actualTokenInSegment).to.be.true;
    }

    it('should add 1 token', async () => {
      const segmentAddress1 = await segmentInstance1.getAddress();
      const tokenAddress1 = await tokenInstance1.getAddress();

      // ### Token #1: segmentInstance1, tokenInstance1 ###
      await tokenInstance1.safeMint(alice, 'au', 'ah', 'mu', 'mh', '0', 'ai');

      await expect(segmentInstance1.addToken(tokenAddress1, '0'))
        .to.emit(segmentInstance1, 'TokenAdded')
        .withArgs(alice, tokenAddress1, '0');
      //.to.emit(segmentInstance1, 'SegmentAddedToToken').withArgs('0', segmentAddress1); // Only exists in Token-extension

      await assertSegment(segmentInstance1, tokenAddress1, 0, 1, 0);
      await assertToken(tokenInstance1, segmentAddress1, 0, 0, 1);
    });

    it('should add 2 tokens from same token address', async () => {
      const segmentAddress = await segmentInstance1.getAddress();
      const tokenAddress = await tokenInstance1.getAddress();

      // ### Token #1: segmentInstance1, tokenInstance1 ###
      await tokenInstance1.safeMint(alice, 'au', 'ah', 'mu', 'mh', '0', 'ai');

      await expect(segmentInstance1.addToken(tokenAddress, '0'))
        .to.emit(segmentInstance1, 'TokenAdded')
        .withArgs(alice, tokenAddress, '0');
      //.to.emit(segmentInstance1, 'SegmentAddedToToken').withArgs('0', segmentAddress); // Only exists in Token-extension

      await assertSegment(segmentInstance1, tokenAddress, 0, 1, 0);
      await assertToken(tokenInstance1, segmentAddress, 0, 0, 1);

      // ### Token #2: segmentInstance1, tokenInstance1 ###
      await tokenInstance1.safeMint(alice, 'au', 'ah', 'mu', 'mh', '1', 'ai');

      await expect(segmentInstance1.addToken(tokenAddress, '1'))
        .to.emit(segmentInstance1, 'TokenAdded')
        .withArgs(alice, tokenAddress, '1');
      //.to.emit(segmentInstance1, 'SegmentAddedToToken').withArgs('1', segmentAddress); // Only exists in Token-extension

      await assertSegment(segmentInstance1, tokenAddress, 1, 2, 1);
      await assertToken(tokenInstance1, segmentAddress, 1, 0, 1);
    });

    it('should add 3 tokens from different token addresses', async () => {
      const segmentAddress1 = await segmentInstance1.getAddress();
      const tokenAddress1 = await tokenInstance1.getAddress();
      const tokenAddress2 = await tokenInstance2.getAddress();

      // ### Token #1: segmentInstance1, tokenInstance1 ###
      await tokenInstance1.safeMint(alice, 'au', 'ah', 'mu', 'mh', '0', 'ai');

      await expect(segmentInstance1.addToken(tokenAddress1, '0'))
        .to.emit(segmentInstance1, 'TokenAdded')
        .withArgs(alice, tokenAddress1, '0');
      //.to.emit(segmentInstance1, 'SegmentAddedToToken').withArgs('0', segmentAddress1); // Only exists in Token-extension

      await assertSegment(segmentInstance1, tokenAddress1, 0, 1, 0);
      await assertToken(tokenInstance1, segmentAddress1, 0, 0, 1);

      // ### Token #2: segmentInstance1, tokenInstance2 ###
      await tokenInstance2.safeMint(alice, 'au', 'ah', 'mu', 'mh', '1', 'ai');

      await expect(segmentInstance1.addToken(tokenAddress2, '0'))
        .to.emit(segmentInstance1, 'TokenAdded')
        .withArgs(alice, tokenAddress2, '0');
      //.to.emit(segmentInstance1, 'SegmentAddedToToken').withArgs('1', segmentAddress1); // Only exists in Token-extension

      await assertSegment(segmentInstance1, tokenAddress2, 0, 2, 1);
      await assertToken(tokenInstance2, segmentAddress1, 0, 0, 1);

      // ### Token #3: segmentInstance1, tokenInstance1 ###
      await tokenInstance1.safeMint(alice, 'au', 'ah', 'mu', 'mh', '2', 'ai');

      await expect(segmentInstance1.addToken(tokenAddress1, '1'))
        .to.emit(segmentInstance1, 'TokenAdded')
        .withArgs(alice, tokenAddress1, '1');
      //.to.emit(segmentInstance1, 'SegmentAddedToToken').withArgs('1', segmentAddress1); // Only exists in Token-extension

      await assertSegment(segmentInstance1, tokenAddress1, 1, 3, 2);
      await assertToken(tokenInstance1, segmentAddress1, 1, 0, 1);
    });

    it('should add 2 tokens to 2 different segments', async () => {
      const segmentAddress1 = await segmentInstance1.getAddress();
      const segmentAddress2 = await segmentInstance2.getAddress();
      const tokenAddress1 = await tokenInstance1.getAddress();

      // ### Token #1: segmentInstance1, tokenInstance1 ### '0', '1', '0', '0', '0'
      await tokenInstance1.safeMint(alice, 'au', 'ah', 'mu', 'mh', '0', 'ai');

      await expect(segmentInstance1.addToken(tokenAddress1, '0'))
        .to.emit(segmentInstance1, 'TokenAdded')
        .withArgs(alice, tokenAddress1, '0');
      //.to.emit(segmentInstance1, 'SegmentAddedToToken').withArgs('0', segmentAddress1); // Only exists in Token-extension

      await assertSegment(segmentInstance1, tokenAddress1, 0, 1, 0);
      await assertToken(tokenInstance1, segmentAddress1, 0, 0, 1);

      // ### Token #2: segmentInstance2, tokenInstance1 ### '0', '1', '0', '1', '1'
      await tokenInstance1.safeMint(alice, 'au', 'ah', 'mu', 'mh', '1', 'ai');

      await expect(segmentInstance2.addToken(tokenAddress1, '1'))
        .to.emit(segmentInstance2, 'TokenAdded')
        .withArgs(alice, tokenAddress1, '1');
      //.to.emit(segmentInstance2, 'SegmentAddedToToken').withArgs('1', segmentAddress2); // Only exists in Token-extension

      await assertSegment(segmentInstance2, tokenAddress1, 1, 1, 0);
      await assertToken(tokenInstance1, segmentAddress2, 1, 0, 1);
    });
  });

  describe("Don't Add Token", () => {
    let containerInstance: Container;
    let segmentInstance: Segment;
    let tokenInstance: Token;
    let validTokenAddress: string;

    beforeEach(async () => {
      containerInstance = await ethers.deployContract('Container', [alice, CONTAINER.name]);

      await containerInstance.createSegment(SEGMENT.name);
      segmentInstance = await ethers.getContractAt('Segment', await containerInstance.getSegment(0));

      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      validTokenAddress = await tokenInstance.getAddress();
    });

    it('should require a valid contract address', async () => {
      await tokenInstance.safeMint(alice, 'au', 'ah', 'mu', 'mh', 'ri', 'ai');

      await expect(segmentInstance.addToken(ethers.ZeroAddress, '0')).to.be.revertedWithCustomError(
        segmentInstance,
        'TokenAddressIsZero',
      );
    });

    it('should require an absent token', async () => {
      await tokenInstance.safeMint(alice, 'au', 'ah', 'mu', 'mh', 'ri', 'ai');
      await segmentInstance.addToken(validTokenAddress, '0');

      await expect(segmentInstance.addToken(validTokenAddress, '0')).to.be.revertedWithCustomError(
        segmentInstance,
        'TokenExistsInSegment',
      );
    });
  });
});
