/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/src/signers';

import { Token, TokenAsset } from '../../../typechain-types';
import { TOKEN } from '../../constants';

describe('Token - TokenAsset', async () => {
  let alice: HardhatEthersSigner;
  let tokenInstance: Token;
  let tokenAddress: string;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  describe('getAsset after mintToken', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      tokenAddress = await tokenInstance.getAddress();
    });

    it('should get asset', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );

      const asset: TokenAsset.AssetStruct = await tokenInstance.getAsset(0);
      expect(asset.uri).to.be.equal(TOKEN.asset1.uriInitial);
      expect(asset.hash).to.be.equal(TOKEN.asset1.hashInitial);
    });

    it('should get asset for multiple minted token', async () => {
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

      const asset1: TokenAsset.AssetStruct = await tokenInstance.getAsset(0);
      expect(asset1.uri).to.be.equal(TOKEN.asset1.uriInitial);
      expect(asset1.hash).to.be.equal(TOKEN.asset1.hashInitial);

      const asset2: TokenAsset.AssetStruct = await tokenInstance.getAsset(1);
      expect(asset2.uri).to.be.equal(TOKEN.asset2.uriInitial);
      expect(asset2.hash).to.be.equal(TOKEN.asset2.hashInitial);
    });

    it('should not get asset', async () => {
      await expect(tokenInstance.getAsset(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
    });
  });

  describe('setAssetUri', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      tokenAddress = await tokenInstance.getAddress();
    });

    it('should set assetUri', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );

      await expect(tokenInstance.setAssetUri(0, TOKEN.asset1.uriUpdated))
        .to.emit(tokenInstance, 'AssetUriSet')
        .withArgs(TOKEN.asset1.uriInitial, TOKEN.asset1.uriUpdated, alice, tokenAddress, 0);

      const asset: TokenAsset.AssetStruct = await tokenInstance.getAsset(0);
      expect(asset.uri).to.be.equal(TOKEN.asset1.uriUpdated);
      expect(asset.hash).to.be.equal(TOKEN.asset1.hashInitial);
    });

    it('should set assetUri for multiple minted token', async () => {
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

      await expect(tokenInstance.setAssetUri(0, TOKEN.asset1.uriUpdated))
        .to.emit(tokenInstance, 'AssetUriSet')
        .withArgs(TOKEN.asset1.uriInitial, TOKEN.asset1.uriUpdated, alice, tokenAddress, 0);

      const asset1: TokenAsset.AssetStruct = await tokenInstance.getAsset(0);
      expect(asset1.uri).to.be.equal(TOKEN.asset1.uriUpdated);
      expect(asset1.hash).to.be.equal(TOKEN.asset1.hashInitial);

      await expect(tokenInstance.setAssetUri(1, TOKEN.asset2.uriUpdated))
        .to.emit(tokenInstance, 'AssetUriSet')
        .withArgs(TOKEN.asset2.uriInitial, TOKEN.asset2.uriUpdated, alice, tokenAddress, 1);

      const asset2: TokenAsset.AssetStruct = await tokenInstance.getAsset(1);
      expect(asset2.uri).to.be.equal(TOKEN.asset2.uriUpdated);
      expect(asset2.hash).to.be.equal(TOKEN.asset2.hashInitial);
    });

    it('should not set assetUri', async () => {
      await expect(tokenInstance.setAssetUri(0, TOKEN.asset1.uriInitial)).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenDoesNotExist',
      );
    });
  });

  describe('setAssetHash', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      tokenAddress = await tokenInstance.getAddress();
    });

    it('should set assetHash', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );

      await expect(tokenInstance.setAssetHash(0, TOKEN.asset1.hashUpdated))
        .to.emit(tokenInstance, 'AssetHashSet')
        .withArgs(TOKEN.asset1.hashInitial, TOKEN.asset1.hashUpdated, alice, tokenAddress, 0);

      const asset: TokenAsset.AssetStruct = await tokenInstance.getAsset(0);
      expect(asset.uri).to.be.equal(TOKEN.asset1.uriInitial);
      expect(asset.hash).to.be.equal(TOKEN.asset1.hashUpdated);
    });

    it('should set assetHash for multiple minted token', async () => {
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

      await expect(tokenInstance.setAssetHash(0, TOKEN.asset1.hashUpdated))
        .to.emit(tokenInstance, 'AssetHashSet')
        .withArgs(TOKEN.asset1.hashInitial, TOKEN.asset1.hashUpdated, alice, tokenAddress, 0);

      const asset1: TokenAsset.AssetStruct = await tokenInstance.getAsset(0);
      expect(asset1.uri).to.be.equal(TOKEN.asset1.uriInitial);
      expect(asset1.hash).to.be.equal(TOKEN.asset1.hashUpdated);

      await expect(tokenInstance.setAssetHash(1, TOKEN.asset2.hashUpdated))
        .to.emit(tokenInstance, 'AssetHashSet')
        .withArgs(TOKEN.asset2.hashInitial, TOKEN.asset2.hashUpdated, alice, tokenAddress, 1);

      const asset2: TokenAsset.AssetStruct = await tokenInstance.getAsset(1);
      expect(asset2.uri).to.be.equal(TOKEN.asset2.uriInitial);
      expect(asset2.hash).to.be.equal(TOKEN.asset2.hashUpdated);
    });

    it('should not set assetHash', async () => {
      await expect(tokenInstance.setAssetHash(0, TOKEN.asset1.hashInitial)).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenDoesNotExist',
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
      tokenAddress = await tokenInstance.getAddress();
    });

    it('should delete assetUri and hash on burning', async () => {
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
        TOKEN.additionalData1.initial,
      );

      await tokenInstance.burn(0);

      // asset uri and hash for token with id 1 should still exist
      const asset = await tokenInstance.getAsset(1);
      expect(asset.uri).to.be.equal(TOKEN.asset2.uriInitial);
      expect(asset.hash).to.be.equal(TOKEN.asset2.hashInitial);

      // asset uri and hash for token with id 0 should be deleted
      await expect(tokenInstance.getAsset(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
    });
  });
});
