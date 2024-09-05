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
  let containerInstance: Container;
  let segmentInstance: Segment;
  let tokenInstance1: Token;
  let tokenInstance2: Token;
  let validTokenAddress1: string;
  let validTokenAddress2: string;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  async function removeTokenAndAssertSegment(
    segmentInstance: Segment,
    tokenInformation: {
      tokenAddress: string;
      tokenId: number;
    },
  ) {
    const aliceAddress = await alice.getAddress();

    await expect(segmentInstance.removeToken(tokenInformation.tokenAddress, tokenInformation.tokenId))
      .to.emit(segmentInstance, 'TokenRemoved')
      .withArgs(aliceAddress, tokenInformation.tokenAddress, tokenInformation.tokenId);

    const actualRemovedTokenInSegment = await segmentInstance.isTokenInSegment(
      tokenInformation.tokenAddress,
      tokenInformation.tokenId,
    );
    expect(actualRemovedTokenInSegment).is.false;
  }

  async function assertToken(
    segmentInstance: Segment,
    eventLength: number,
    tokenInformation: {
      tokenAddress: string;
      tokenId: number;
    },
  ) {
    const segmentAddress = await segmentInstance.getAddress();

    const tokenInstance = await ethers.getContractAt('Token', tokenInformation.tokenAddress);

    const events = await tokenInstance.queryFilter(tokenInstance.filters.SegmentRemovedFromToken);
    expect(events.length).to.equal(eventLength);
    expect(events[eventLength - 1].args.tokenId).to.equal(tokenInformation.tokenId);
    expect(events[eventLength - 1].args.segment).to.equal(segmentAddress);

    const segmentInToken = await tokenInstance.isTokenInSegment(tokenInformation.tokenId, segmentAddress);
    expect(segmentInToken).is.false;
  }

  describe('Remove Token', () => {
    beforeEach(async () => {
      containerInstance = await ethers.deployContract('Container', [alice, CONTAINER.name]);
      await containerInstance.createSegment(SEGMENT.name);
      segmentInstance = await ethers.getContractAt('Segment', await containerInstance.getSegment(0));

      tokenInstance1 = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      validTokenAddress1 = await tokenInstance1.getAddress();

      tokenInstance2 = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token2.name,
        TOKEN.token2.symbol,
      ]);
      validTokenAddress2 = await tokenInstance2.getAddress();
    });

    it('should add 1 token and remove 1 token', async () => {
      await tokenInstance1.mintToken(alice, 'au', 'ah', 'mu', 'mh', 'ri', 'ai');
      await segmentInstance.addToken(validTokenAddress1, '0');

      await removeTokenAndAssertSegment(segmentInstance, {
        tokenAddress: validTokenAddress1,
        tokenId: 0,
      });

      await assertToken(segmentInstance, 1, {
        tokenAddress: validTokenAddress1,
        tokenId: 0,
      });

      const actualTokenInformationArray = await segmentInstance.getAllTokenInformation();
      expect(actualTokenInformationArray.length).equal(Number('0'));

      await expect(segmentInstance.getTokenInformation('0')).to.be.revertedWithCustomError(
        segmentInstance,
        'IndexExceedsTokenInformationLength',
      );

      const actualNumberOfTokenInformation = await segmentInstance.getNumberOfTokenInformation();
      expect(actualNumberOfTokenInformation).to.equal('0');
    });

    it('should add 2 tokens and remove first token', async () => {
      await tokenInstance1.mintToken(alice, 'au', 'ah', 'mu', 'mh', 'ri1', 'ai');
      await tokenInstance1.mintToken(alice, 'au', 'ah', 'mu', 'mh', 'ri2', 'ai');
      await segmentInstance.addToken(validTokenAddress1, '0');
      await segmentInstance.addToken(validTokenAddress1, '1');

      // Remove first token
      await removeTokenAndAssertSegment(segmentInstance, {
        tokenAddress: validTokenAddress1,
        tokenId: 0,
      });

      await assertToken(segmentInstance, 1, {
        tokenAddress: validTokenAddress1,
        tokenId: 0,
      });

      const actualMovedTokenInformation = await segmentInstance.getTokenInformation('0');
      expect(actualMovedTokenInformation.tokenAddress).equals(validTokenAddress1);
      expect(actualMovedTokenInformation.tokenId).equals('1');

      const actualMovedTokenInSegment = await segmentInstance.isTokenInSegment(validTokenAddress1, '1');
      expect(actualMovedTokenInSegment).is.true;
    });

    it('should add 2 token and remove second token', async () => {
      await tokenInstance1.mintToken(alice, 'au', 'ah', 'mu', 'mh', 'ri1', 'ai');
      await tokenInstance1.mintToken(alice, 'au', 'ah', 'mu', 'mh', 'ri2', 'ai');
      await segmentInstance.addToken(validTokenAddress1, '0');
      await segmentInstance.addToken(validTokenAddress1, '1');

      // Remove second token
      await removeTokenAndAssertSegment(segmentInstance, {
        tokenAddress: validTokenAddress1,
        tokenId: 1,
      });

      await assertToken(segmentInstance, 1, {
        tokenAddress: validTokenAddress1,
        tokenId: 1,
      });

      const actualMovedTokenInformation = await segmentInstance.getTokenInformation('0');
      expect(actualMovedTokenInformation.tokenAddress).equals(validTokenAddress1);
      expect(actualMovedTokenInformation.tokenId).equals('0');

      const actualMovedTokenInSegment = await segmentInstance.isTokenInSegment(validTokenAddress1, '0');
      expect(actualMovedTokenInSegment).is.true;
    });

    it('should add 3 token and remove 3 token', async () => {
      await tokenInstance1.mintToken(alice, 'au', 'ah', 'mu', 'mh', 'ri1', 'ai');
      await tokenInstance2.mintToken(alice, 'au', 'ah', 'mu', 'mh', 'ri2', 'ai');
      await tokenInstance1.mintToken(alice, 'au', 'ah', 'mu', 'mh', 'ri3', 'ai');
      await segmentInstance.addToken(validTokenAddress1, '0');
      await segmentInstance.addToken(validTokenAddress2, '0');
      await segmentInstance.addToken(validTokenAddress1, '1');

      // Remove first token
      await removeTokenAndAssertSegment(segmentInstance, {
        tokenAddress: validTokenAddress1,
        tokenId: 0,
      });

      await assertToken(segmentInstance, 1, {
        tokenAddress: validTokenAddress1,
        tokenId: 0,
      });

      const actualMovedTokenInformation = await segmentInstance.getTokenInformation('0');
      expect(actualMovedTokenInformation.tokenAddress).equals(validTokenAddress1);
      expect(actualMovedTokenInformation.tokenId).equals('1');

      const actualMovedTokenInSegment = await segmentInstance.isTokenInSegment(validTokenAddress1, '1');
      expect(actualMovedTokenInSegment).is.true;

      // Ensure second token is still in segment (former third element is now first element)
      const actualTokenInformation = await segmentInstance.getTokenInformation('1');
      expect(actualTokenInformation.tokenAddress).equals(validTokenAddress2);
      expect(actualTokenInformation.tokenId).equals('0');

      // Remove second token
      await removeTokenAndAssertSegment(segmentInstance, {
        tokenAddress: validTokenAddress2,
        tokenId: 0,
      });

      await assertToken(segmentInstance, 1, {
        tokenAddress: validTokenAddress2,
        tokenId: 0,
      });

      const actualMovedTokenInformation2 = await segmentInstance.getTokenInformation('0');
      expect(actualMovedTokenInformation2.tokenAddress).equals(validTokenAddress1);
      expect(actualMovedTokenInformation2.tokenId).equals('1');

      const actualMovedTokenInSegment2 = await segmentInstance.isTokenInSegment(validTokenAddress1, '1');
      expect(actualMovedTokenInSegment2).is.true;

      // One element remains in array left
      await expect(segmentInstance.getTokenInformation('1')).to.be.revertedWithCustomError(
        segmentInstance,
        'IndexExceedsTokenInformationLength',
      );

      // Remove former third token
      await removeTokenAndAssertSegment(segmentInstance, {
        tokenAddress: validTokenAddress1,
        tokenId: 1,
      });

      await assertToken(segmentInstance, 2, {
        tokenAddress: validTokenAddress1,
        tokenId: 1,
      });

      // Array is empty
      await expect(segmentInstance.getTokenInformation('0')).to.be.revertedWithCustomError(
        segmentInstance,
        'IndexExceedsTokenInformationLength',
      );
    });
  });

  describe("Don't Remove Token", () => {
    beforeEach(async () => {
      containerInstance = await ethers.deployContract('Container', [alice, CONTAINER.name]);
      await containerInstance.createSegment(SEGMENT.name);
      segmentInstance = await ethers.getContractAt('Segment', await containerInstance.getSegment(0));

      tokenInstance1 = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      validTokenAddress1 = await tokenInstance1.getAddress();
    });

    it('should require a valid contract address', async () => {
      await tokenInstance1.mintToken(alice, 'au', 'ah', 'mu', 'mh', 'ri', 'ai');

      await expect(segmentInstance.removeToken(ethers.ZeroAddress, '0')).to.be.revertedWithCustomError(
        segmentInstance,
        'TokenAddressIsZero',
      );
    });

    it('should require a present token', async () => {
      await tokenInstance1.mintToken(alice, 'au', 'ah', 'mu', 'mh', 'ri', 'ai');
      await segmentInstance.addToken(validTokenAddress1, '0');

      await expect(segmentInstance.removeToken(validTokenAddress1, '1')).to.be.revertedWithCustomError(
        segmentInstance,
        'TokenDoesNotExistInSegment',
      );
    });
  });
});
