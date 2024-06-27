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

describe('Token - Extension ERC721Asset', async () => {
  let alice: HardhatEthersSigner;
  let tokenInstance: Token;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  describe('getAssetUri', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should get assetUri', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      const assetUri = await tokenInstance.getAssetUri(0);
      expect(assetUri).to.be.equal(TOKEN.asset1.uri);
    });

    it('should get assetUri for multiple minted token', async () => {
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
        TOKEN.asset2.uri,
        TOKEN.asset2.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      const assetUri1 = await tokenInstance.getAssetUri(0);
      expect(assetUri1).to.be.equal(TOKEN.asset1.uri);

      const assetUri2 = await tokenInstance.getAssetUri(1);
      expect(assetUri2).to.be.equal(TOKEN.asset2.uri);
    });

    it('should not get assetUri', async () => {
      await expect(tokenInstance.getAssetUri(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenIdDoesNotExist');
    });
  });

  describe('setAssetUri', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should set assetUri', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      await tokenInstance.setAssetUri(0, TOKEN.asset1.uri);

      const assetUri = await tokenInstance.getAssetUri(0);
      expect(assetUri).to.be.equal(TOKEN.asset1.uri);
    });

    it('should set assetUri for multiple minted token', async () => {
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
        TOKEN.asset2.uri,
        TOKEN.asset2.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      await tokenInstance.setAssetUri(0, TOKEN.asset1.uri);
      const assetUri1 = await tokenInstance.getAssetUri(0);
      expect(assetUri1).to.be.equal(TOKEN.asset1.uri);

      await tokenInstance.setAssetUri(1, TOKEN.asset2.uri);
      const assetUri2 = await tokenInstance.getAssetUri(1);
      expect(assetUri2).to.be.equal(TOKEN.asset2.uri);
    });

    it('should not set assetUri', async () => {
      await expect(tokenInstance.setAssetUri(0, TOKEN.asset1.uri)).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenIdDoesNotExist',
      );
    });
  });

  describe('getAssetHash', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should get assetHash', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      const assetUri = await tokenInstance.getAssetHash(0);
      expect(assetUri).to.be.equal(TOKEN.asset1.hash);
    });

    it('should get assetHash for multiple minted token', async () => {
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
        TOKEN.asset2.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      const assetHash1 = await tokenInstance.getAssetHash(0);
      expect(assetHash1).to.be.equal(TOKEN.asset1.hash);

      const assetHash2 = await tokenInstance.getAssetHash(1);
      expect(assetHash2).to.be.equal(TOKEN.asset2.hash);
    });

    it('should get assetInformation for multiple minted token', async () => {
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
        TOKEN.asset2.uri,
        TOKEN.asset2.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      const assetInformation1 = await tokenInstance.getAssetInformation(0);
      expect(assetInformation1.assetUri).to.be.equal(TOKEN.asset1.uri);
      expect(assetInformation1.assetHash).to.be.equal(TOKEN.asset1.hash);

      const assetInformation2 = await tokenInstance.getAssetInformation(1);
      expect(assetInformation2.assetUri).to.be.equal(TOKEN.asset2.uri);
      expect(assetInformation2.assetHash).to.be.equal(TOKEN.asset2.hash);
    });

    it('should not get assetHash', async () => {
      await expect(tokenInstance.getAssetHash(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenIdDoesNotExist');
    });
  });

  describe('setAssetHash', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should set assetHash', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      await tokenInstance.setAssetHash(0, TOKEN.asset1.hash);

      const assetUri = await tokenInstance.getAssetHash(0);
      expect(assetUri).to.be.equal(TOKEN.asset1.hash);
    });

    it('should set assetHash for multiple minted token', async () => {
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
        TOKEN.asset2.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      await tokenInstance.setAssetHash(0, TOKEN.asset1.hash);
      const assetHash1 = await tokenInstance.getAssetHash(0);
      expect(assetHash1).to.be.equal(TOKEN.asset1.hash);

      await tokenInstance.setAssetHash(1, TOKEN.asset2.hash);
      const assetHash2 = await tokenInstance.getAssetHash(1);
      expect(assetHash2).to.be.equal(TOKEN.asset2.hash);
    });

    it('should not set assetHash', async () => {
      await expect(tokenInstance.setAssetHash(0, TOKEN.asset1.hash)).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenIdDoesNotExist',
      );
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

    it('should delete assetUri and hash on burning', async () => {
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
        TOKEN.asset2.uri,
        TOKEN.asset2.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      await tokenInstance.burn(0);

      // asset uri and hash for token with id 1 should still exist
      const assetInformation2 = await tokenInstance.getAssetInformation(1);
      expect(assetInformation2.assetUri).to.be.equal(TOKEN.asset2.uri);
      expect(assetInformation2.assetHash).to.be.equal(TOKEN.asset2.hash);

      const assetUri2 = await tokenInstance.getAssetUri(1);
      expect(assetUri2).to.be.equal(TOKEN.asset2.uri);

      const assetHash2 = await tokenInstance.getAssetHash(1);
      expect(assetHash2).to.be.equal(TOKEN.asset2.hash);

      // asset uri and hash for token with id 0 should be deleted
      await expect(tokenInstance.getAssetUri(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenIdDoesNotExist');
      await expect(tokenInstance.getAssetHash(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenIdDoesNotExist');
    });
  });
});
