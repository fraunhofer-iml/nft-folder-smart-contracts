/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/src/signers';

import { Token } from '../../../typechain-types';
import { SEGMENT, TOKEN } from '../../constants';

describe('Token - Extension ERC721SegmentAllocation', async () => {
  let alice: HardhatEthersSigner;
  let tokenInstance: Token;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  describe('addTokenToSegment', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [TOKEN.token1.name, TOKEN.token1.symbol]);
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
    });

    it('should not add Segment to Token from Token Contract', async () => {
      await expect(tokenInstance.addTokenToSegment(0, SEGMENT.address)).to.be.revertedWithCustomError(
        tokenInstance,
        'NotASegment',
      );
    });
  });

  describe('removeTokenFromSegment', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [TOKEN.token1.name, TOKEN.token1.symbol]);
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
    });

    it('should not remove Segment to Token from Token Contract', async () => {
      await expect(tokenInstance.removeTokenFromSegment(0, SEGMENT.address)).to.be.revertedWithCustomError(
        tokenInstance,
        'NotASegment',
      );
    });
  });
});
