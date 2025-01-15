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

import { Token } from '../../../typechain-types';
import { TOKEN } from '../../constants';

describe('Token - TokenRemoteId', async () => {
  let alice: HardhatEthersSigner;
  let tokenInstance: Token;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  describe('getRemoteId after mintToken', function () {
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
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );

      const remoteId = await tokenInstance.getRemoteIdByTokenId(0);
      expect(remoteId).to.be.equal(TOKEN.remoteId1);
    });

    it('should get different remote ids for different tokens', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset2.uriInitial,
        TOKEN.asset2.hashInitial,
        TOKEN.metadata2.uriInitial,
        TOKEN.metadata2.hashInitial,
        TOKEN.remoteId2,
        TOKEN.additionalData2.initial,
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

  describe('getTokenId after mintToken', function () {
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
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );

      const tokenIdForRemoteId: bigint = (await tokenInstance.getTokenIdsByRemoteId(TOKEN.remoteId1))[0];
      expect(tokenIdForRemoteId).to.be.equal(0n);

      const tokenIdForOwner: bigint = (await tokenInstance.getTokenIdsByOwner(alice))[0];
      expect(tokenIdForOwner).to.be.equal(0n);
    });

    it('should get different token ids for different tokens', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset2.uriInitial,
        TOKEN.asset2.hashInitial,
        TOKEN.metadata2.uriInitial,
        TOKEN.metadata2.hashInitial,
        TOKEN.remoteId2,
        TOKEN.additionalData2.initial,
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
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset2.uriInitial,
        TOKEN.asset2.hashInitial,
        TOKEN.metadata2.uriInitial,
        TOKEN.metadata2.hashInitial,
        TOKEN.remoteId2,
        TOKEN.additionalData2.initial,
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
      expect((await tokenInstance.getTokenIdsByRemoteId(TOKEN.remoteId1)).length).to.be.equal(0);
    });
  });
});
