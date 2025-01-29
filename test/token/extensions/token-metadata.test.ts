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

describe('Token - TokenMetadata', async () => {
  let alice: HardhatEthersSigner;
  let tokenInstance: Token;
  let tokenAddress: string;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  describe('getMetadata after mintToken', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      tokenAddress = await tokenInstance.getAddress();
    });

    it('should get metadata', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.remoteId1,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.additionalData1.initial,
      );

      const tokenDataStruct: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(0)).tokenData;
      expect(tokenDataStruct.metadata.uri).to.be.equal(TOKEN.metadata1.uriInitial);
      expect(tokenDataStruct.metadata.hash).to.be.equal(TOKEN.metadata1.hashInitial);
    });

    it('should get metadata for multiple minted token', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.remoteId1,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.additionalData1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.remoteId2,
        TOKEN.asset2.uriInitial,
        TOKEN.asset2.hashInitial,
        TOKEN.metadata2.uriInitial,
        TOKEN.metadata2.hashInitial,
        TOKEN.additionalData2.initial,
      );

      const tokenDataStruct1: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(0)).tokenData;
      expect(tokenDataStruct1.metadata.uri).to.be.equal(TOKEN.metadata1.uriInitial);
      expect(tokenDataStruct1.metadata.hash).to.be.equal(TOKEN.metadata1.hashInitial);

      const tokenDataStruct2: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(1)).tokenData;
      expect(tokenDataStruct2.metadata.uri).to.be.equal(TOKEN.metadata2.uriInitial);
      expect(tokenDataStruct2.metadata.hash).to.be.equal(TOKEN.metadata2.hashInitial);
    });

    it('should not get metadata', async () => {
      await expect(tokenInstance.getToken(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
    });
  });

  describe('setmetadata.uri', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      tokenAddress = await tokenInstance.getAddress();
    });

    it('should set metadata.uri', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.remoteId1,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.additionalData1.initial,
      );

      await expect(tokenInstance.updateToken(0, '', '', TOKEN.metadata1.uriUpdated, '', ''))
        .to.emit(tokenInstance, 'TokenUpdate')
        .withArgs(alice, tokenAddress, 0);

      const tokenDataStruct: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(0)).tokenData;
      expect(tokenDataStruct.metadata.uri).to.be.equal(TOKEN.metadata1.uriUpdated);
      expect(tokenDataStruct.metadata.hash).to.be.equal(TOKEN.metadata1.hashInitial);
    });

    it('should set metadata.uri for multiple minted token', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.remoteId1,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.additionalData1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.remoteId2,
        TOKEN.asset2.uriInitial,
        TOKEN.asset2.hashInitial,
        TOKEN.metadata2.uriInitial,
        TOKEN.metadata2.hashInitial,
        TOKEN.additionalData2.initial,
      );

      await expect(tokenInstance.updateToken(0, '', '', TOKEN.metadata1.uriUpdated, '', ''))
        .to.emit(tokenInstance, 'TokenUpdate')
        .withArgs(alice, tokenAddress, 0);

      const tokenDataStruct1: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(0)).tokenData;
      expect(tokenDataStruct1.metadata.uri).to.be.equal(TOKEN.metadata1.uriUpdated);
      expect(tokenDataStruct1.metadata.hash).to.be.equal(TOKEN.metadata1.hashInitial);

      await expect(tokenInstance.updateToken(1, '', '', TOKEN.metadata2.uriUpdated, '', ''))
        .to.emit(tokenInstance, 'TokenUpdate')
        .withArgs(alice, tokenAddress, 1);

      const tokenDataStruct2: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(1)).tokenData;
      expect(tokenDataStruct2.metadata.uri).to.be.equal(TOKEN.metadata2.uriUpdated);
      expect(tokenDataStruct2.metadata.hash).to.be.equal(TOKEN.metadata2.hashInitial);
    });

    it('should not set metadata.uri', async () => {
      await expect(
        tokenInstance.updateToken(0, '', '', '', TOKEN.metadata1.hashUpdated, ''),
      ).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
    });
  });

  describe('setmetadata.hash', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      tokenAddress = await tokenInstance.getAddress();
    });

    it('should set metadata.hash', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.remoteId1,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.additionalData1.initial,
      );

      await expect(tokenInstance.updateToken(0, '', '', '', TOKEN.metadata1.hashUpdated, ''))
        .to.emit(tokenInstance, 'TokenUpdate')
        .withArgs(alice, tokenAddress, 0);

      const tokenDataStruct: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(0)).tokenData;
      expect(tokenDataStruct.metadata.uri).to.be.equal(TOKEN.metadata1.uriInitial);
      expect(tokenDataStruct.metadata.hash).to.be.equal(TOKEN.metadata1.hashUpdated);
    });

    it('should set metadata.hash for multiple minted token', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.remoteId1,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.additionalData1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.remoteId2,
        TOKEN.asset2.uriInitial,
        TOKEN.asset2.hashInitial,
        TOKEN.metadata2.uriInitial,
        TOKEN.metadata2.hashInitial,
        TOKEN.additionalData2.initial,
      );

      await expect(tokenInstance.updateToken(0, '', '', '', TOKEN.metadata1.hashUpdated, ''))
        .to.emit(tokenInstance, 'TokenUpdate')
        .withArgs(alice, tokenAddress, 0);

      const tokenDataStruct1: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(0)).tokenData;
      expect(tokenDataStruct1.metadata.uri).to.be.equal(TOKEN.metadata1.uriInitial);
      expect(tokenDataStruct1.metadata.hash).to.be.equal(TOKEN.metadata1.hashUpdated);

      await expect(tokenInstance.updateToken(1, '', '', '', TOKEN.metadata2.hashUpdated, ''))
        .to.emit(tokenInstance, 'TokenUpdate')
        .withArgs(alice, tokenAddress, 1);

      const tokenDataStruct2: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(1)).tokenData;
      expect(tokenDataStruct2.metadata.uri).to.be.equal(TOKEN.metadata2.uriInitial);
      expect(tokenDataStruct2.metadata.hash).to.be.equal(TOKEN.metadata2.hashUpdated);
    });

    it('should not set metadata.hash', async () => {
      await expect(
        tokenInstance.updateToken(0, '', '', '', TOKEN.metadata1.hashInitial, ''),
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

    it('should delete tokenURI and hash on burning', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.remoteId1,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.additionalData1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.remoteId2,
        TOKEN.asset2.uriInitial,
        TOKEN.asset2.hashInitial,
        TOKEN.metadata2.uriInitial,
        TOKEN.metadata2.hashInitial,
        TOKEN.additionalData2.initial,
      );

      await tokenInstance.burn(0);

      // tokenURI and hash for token with id 1 should still exist
      const tokenUri = await tokenInstance.tokenURI(1);
      expect(tokenUri).to.be.equal(TOKEN.metadata2.uriInitial);

      const tokenDataStruct: TokenDataStorage.TokenDataStruct = (await tokenInstance.getToken(1)).tokenData;
      expect(tokenDataStruct.metadata.uri).to.be.equal(TOKEN.metadata2.uriInitial);
      expect(tokenDataStruct.metadata.hash).to.be.equal(TOKEN.metadata2.hashInitial);

      // uri and hash for token with id 0 should be deleted
      await expect(tokenInstance.tokenURI(0)).to.be.revertedWithCustomError(tokenInstance, 'ERC721NonexistentToken');

      await expect(tokenInstance.getToken(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
    });
  });
});
