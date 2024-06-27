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
import { TOKEN } from '../../constants';

describe('Token - Extension ERC721AdditionalInformation', async () => {
  let alice: HardhatEthersSigner;
  let tokenInstance: Token;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  describe('getAdditionalInformation', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should get additional info', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      const additionalInformation = await tokenInstance.getAdditionalInformation(0);
      expect(additionalInformation).to.be.equal(TOKEN.additionalInformation1.initial);
    });

    it('should get different additional info for different tokens', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation2.initial,
      );

      const additionalInformation1 = await tokenInstance.getAdditionalInformation(0);
      expect(additionalInformation1).to.be.equal(TOKEN.additionalInformation1.initial);

      const additionalInformation2 = await tokenInstance.getAdditionalInformation(1);
      expect(additionalInformation2).to.be.equal(TOKEN.additionalInformation2.initial);
    });

    it('should not get additional info', async () => {
      await expect(tokenInstance.getAdditionalInformation(0)).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenIdDoesNotExist',
      );
    });
  });

  describe('setAdditionalInformation', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should set additional info', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      await tokenInstance.setAdditionalInformation(0, TOKEN.additionalInformation1.updated);
      const additionalInformation = await tokenInstance.getAdditionalInformation(0);
      expect(additionalInformation).to.be.equal(TOKEN.additionalInformation1.updated);
    });

    it('should get different additional info for different tokens', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation2.initial,
      );

      await tokenInstance.setAdditionalInformation(0, TOKEN.additionalInformation1.initial);
      const additionalInformation1 = await tokenInstance.getAdditionalInformation(0);
      expect(additionalInformation1).to.be.equal(TOKEN.additionalInformation1.initial);

      await tokenInstance.setAdditionalInformation(1, TOKEN.additionalInformation2.updated);
      const additionalInformation2 = await tokenInstance.getAdditionalInformation(1);
      expect(additionalInformation2).to.be.equal(TOKEN.additionalInformation2.updated);
    });

    it('should not set additional info', async () => {
      await expect(
        tokenInstance.setAdditionalInformation(0, TOKEN.additionalInformation1.initial),
      ).to.be.revertedWithCustomError(tokenInstance, 'TokenIdDoesNotExist');
    });
  });

  describe('_burn', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should delete additionalInformation on burning', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        '1',
        '1',
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        '2',
        '2',
        TOKEN.remoteId2,
        TOKEN.additionalInformation2.initial,
      );

      await tokenInstance.burn(0);

      // additionalInformation for token with id 1 should still exist
      const additionalInformation2 = await tokenInstance.getAdditionalInformation(1);
      expect(additionalInformation2).to.be.equal(TOKEN.additionalInformation2.initial);

      // additionalInformation for token with id 0 should be deleted
      await expect(tokenInstance.getAdditionalInformation(0)).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenIdDoesNotExist',
      );
    });
  });
});
