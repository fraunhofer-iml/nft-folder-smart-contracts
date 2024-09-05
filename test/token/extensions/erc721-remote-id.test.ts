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

describe('Token - Extension ERC721RemoteId', async () => {
  let alice: HardhatEthersSigner;
  let tokenInstance: Token;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  describe('getRemoteId', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should get remote id', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      const remoteId = await tokenInstance.getRemoteIdByTokenId(0);
      expect(remoteId).to.be.equal(TOKEN.remoteId1);
    });

    it('should get different remote ids for different tokens', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      const remoteId1 = await tokenInstance.getRemoteIdByTokenId(0);
      expect(remoteId1).to.be.equal(TOKEN.remoteId1);

      const remoteId2 = await tokenInstance.getRemoteIdByTokenId(1);
      expect(remoteId2).to.be.equal(TOKEN.remoteId2);
    });

    it('should not get remote id', async () => {
      await expect(tokenInstance.getRemoteIdByTokenId(0)).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenDoesNotExist',
      );
    });
  });

  describe('getTokenId', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should get token id', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      const tokenIdForRemoteId: bigint = (await tokenInstance.getTokenIdsByRemoteId(TOKEN.remoteId1))[0];
      expect(tokenIdForRemoteId).to.be.equal(0n);

      const tokenIdForOwner: bigint = (await tokenInstance.getTokenIdsByOwner(alice))[0];
      expect(tokenIdForOwner).to.be.equal(0n);
    });

    it('should get different token ids for different tokens', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      const tokenId1ForRemoteId: bigint = (await tokenInstance.getTokenIdsByRemoteId(TOKEN.remoteId1))[0];
      expect(tokenId1ForRemoteId).to.be.equal(0n);

      const tokenId2ForRemoteId: bigint = (await tokenInstance.getTokenIdsByRemoteId(TOKEN.remoteId2))[0];
      expect(tokenId2ForRemoteId).to.be.equal(1n);

      const tokenId1ForOwner: bigint = (await tokenInstance.getTokenIdsByOwner(alice))[0];
      expect(tokenId1ForOwner).to.be.equal(0n);

      const tokenId2ForOwner: bigint = (await tokenInstance.getTokenIdsByOwner(alice))[0];
      expect(tokenId2ForOwner).to.be.equal(0n);
    });

    it('should not get token id for remote id', async () => {
      expect((await tokenInstance.getTokenIdsByRemoteId(TOKEN.remoteId1)).length).to.be.equal(0);
    });

    it('should not get token id for owner', async () => {
      expect((await tokenInstance.getTokenIdsByOwner(alice)).length).to.be.equal(0);
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

    it('should delete ids on burning', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        '1',
        '1',
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        '2',
        '2',
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      await tokenInstance.burn(0);

      // ids for token with id 1 should still exist
      const remoteId2 = await tokenInstance.getRemoteIdByTokenId(1);
      expect(remoteId2).to.be.equal(TOKEN.remoteId2);
      const tokenId2ForRemoteId: bigint = (await tokenInstance.getTokenIdsByRemoteId(TOKEN.remoteId2))[0];
      expect(tokenId2ForRemoteId).to.be.equal(1n);
      const tokenId2ForOwner: bigint = (await tokenInstance.getTokenIdsByOwner(alice))[0];
      expect(tokenId2ForOwner).to.be.equal(1n);

      // ids for token with id 0 should be deleted
      await expect(tokenInstance.getRemoteIdByTokenId(0)).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenDoesNotExist',
      );
      await expect((await tokenInstance.getTokenIdsByRemoteId(TOKEN.remoteId1)).length).to.be.equal(0);
    });
  });
});
