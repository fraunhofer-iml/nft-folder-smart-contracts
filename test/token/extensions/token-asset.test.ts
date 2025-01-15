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
import { TokenDataStorage } from '../../../typechain-types/contracts/Token';

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

      const tokenDataStruct: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(0)).tokenData;
      expect(tokenDataStruct.asset.uri).to.be.equal(TOKEN.asset1.uriInitial);
      expect(tokenDataStruct.asset.hash).to.be.equal(TOKEN.asset1.hashInitial);
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

      const tokenDataStruct1: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(0)).tokenData;
      expect(tokenDataStruct1.asset.uri).to.be.equal(TOKEN.asset1.uriInitial);
      expect(tokenDataStruct1.asset.hash).to.be.equal(TOKEN.asset1.hashInitial);

      const tokenDataStruct2: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(1)).tokenData;
      expect(tokenDataStruct2.asset.uri).to.be.equal(TOKEN.asset2.uriInitial);
      expect(tokenDataStruct2.asset.hash).to.be.equal(TOKEN.asset2.hashInitial);
    });

    it('should not get asset', async () => {
      await expect(tokenInstance.getToken(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
    });
  });

  describe('setasset.uri', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      tokenAddress = await tokenInstance.getAddress();
    });

    it('should set asset.uri', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );

      await expect(tokenInstance.updateToken(0, TOKEN.asset1.uriUpdated, '', '', '', ''))
        .to.emit(tokenInstance, 'TokenUpdate')
        .withArgs(alice, tokenAddress, 0);

      const tokenDataStruct: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(0)).tokenData;
      expect(tokenDataStruct.asset.uri).to.be.equal(TOKEN.asset1.uriUpdated);
      expect(tokenDataStruct.asset.hash).to.be.equal(TOKEN.asset1.hashInitial);
    });

    it('should set asset.uri for multiple minted token', async () => {
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

      await expect(tokenInstance.updateToken(0, TOKEN.asset1.uriUpdated, '', '', '', ''))
        .to.emit(tokenInstance, 'TokenUpdate')
        .withArgs(alice, tokenAddress, 0);

      const tokenDataStruct1: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(0)).tokenData;
      expect(tokenDataStruct1.asset.uri).to.be.equal(TOKEN.asset1.uriUpdated);
      expect(tokenDataStruct1.asset.hash).to.be.equal(TOKEN.asset1.hashInitial);

      await expect(tokenInstance.updateToken(1, TOKEN.asset2.uriUpdated, '', '', '', ''))
        .to.emit(tokenInstance, 'TokenUpdate')
        .withArgs(alice, tokenAddress, 1);

      const tokenDataStruct2: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(1)).tokenData;
      expect(tokenDataStruct2.asset.uri).to.be.equal(TOKEN.asset2.uriUpdated);
      expect(tokenDataStruct2.asset.hash).to.be.equal(TOKEN.asset2.hashInitial);
    });

    it('should not set asset.uri', async () => {
      await expect(tokenInstance.updateToken(0, TOKEN.asset1.uriInitial, '', '', '', '')).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenDoesNotExist',
      );
    });
  });

  describe('setasset.hash', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      tokenAddress = await tokenInstance.getAddress();
    });

    it('should set asset.hash', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );

      await expect(tokenInstance.updateToken(0, '', TOKEN.asset1.hashUpdated, '', '', ''))
        .to.emit(tokenInstance, 'TokenUpdate')
        .withArgs(alice, tokenAddress, 0);

      const tokenDataStruct: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(0)).tokenData;
      expect(tokenDataStruct.asset.uri).to.be.equal(TOKEN.asset1.uriInitial);
      expect(tokenDataStruct.asset.hash).to.be.equal(TOKEN.asset1.hashUpdated);
    });

    it('should set asset.hash for multiple minted token', async () => {
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

      await expect(tokenInstance.updateToken(0, '', TOKEN.asset1.hashUpdated, '', '', ''))
        .to.emit(tokenInstance, 'TokenUpdate')
        .withArgs(alice, tokenAddress, 0);

      const tokenDataStruct1: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(0)).tokenData;
      expect(tokenDataStruct1.asset.uri).to.be.equal(TOKEN.asset1.uriInitial);
      expect(tokenDataStruct1.asset.hash).to.be.equal(TOKEN.asset1.hashUpdated);

      await expect(tokenInstance.updateToken(1, '', TOKEN.asset2.hashUpdated, '', '', ''))
        .to.emit(tokenInstance, 'TokenUpdate')
        .withArgs(alice, tokenAddress, 1);

      const tokenDataStruct2: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(1)).tokenData;
      expect(tokenDataStruct2.asset.uri).to.be.equal(TOKEN.asset2.uriInitial);
      expect(tokenDataStruct2.asset.hash).to.be.equal(TOKEN.asset2.hashUpdated);
    });

    it('should not set asset.hash', async () => {
      await expect(
        tokenInstance.updateToken(0, '', TOKEN.asset1.hashInitial, '', '', ''),
      ).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
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

    it('should delete asset.uri and hash on burning', async () => {
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
      const tokenDataStruct: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(1)).tokenData;
      expect(tokenDataStruct.asset.uri).to.be.equal(TOKEN.asset2.uriInitial);
      expect(tokenDataStruct.asset.hash).to.be.equal(TOKEN.asset2.hashInitial);

      // asset uri and hash for token with id 0 should be deleted
      await expect(tokenInstance.getToken(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
    });
  });
});
